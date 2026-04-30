import { Router, type IRouter, type Request } from "express";
import { logger } from "../lib/logger";
import { getXaiClient, getOpenAIClient } from "../lib/ai-clients";
import { searchDiscogs, getDiscogsRelease } from "../lib/discogs";
import type { DiscogsRelease } from "../lib/discogs";

const router: IRouter = Router();

const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

interface ItemMeta {
  lens?: string;
  marketplace?: string;
  photoUrls?: string[];
  hint?: string;
}
interface GuardMeta {
  url?: string;
  screenshotUrls?: string[];
  lens?: string;
}

const itemMeta = new Map<string, ItemMeta>();
const studioStore = new Map<string, Record<string, unknown>>();
const guardMeta = new Map<string, GuardMeta>();
const guardStore = new Map<string, Record<string, unknown>>();

const body = (req: Request): Record<string, unknown> =>
  (req.body as Record<string, unknown>) ?? {};

function imageContent(urls: string[]): { type: "image_url"; image_url: { url: string } }[] {
  return urls
    .filter(Boolean)
    .map((url) => ({ type: "image_url" as const, image_url: { url } }));
}

async function runStudioAnalysis(
  lens: string,
  photoUrls: string[],
  hint?: string,
): Promise<Record<string, unknown>> {
  const openai = getOpenAIClient();
  const lensLabel = lens === "RecordLens" ? "vinyl record" : "item";

  const systemPrompt = `You are an expert resale analyst for ${lensLabel}s. Analyse the provided photos and return ONLY valid JSON conforming exactly to this schema (no markdown, no code fences):
{
  "mode": "studio",
  "lens": "${lens}",
  "identity": { "brand": string|null, "model": string|null, "confidence": 0-1 },
  "attributes": { ...key-value pairs relevant to the ${lensLabel} },
  "missing_photos": [ ...strings listing missing shots needed ],
  "pricing": { "quick_sale": number, "recommended": number, "high": number, "currency": "GBP", "confidence": 0-1 },
  "marketplace_outputs": {
    "ebay": { "title": string, "condition": string, "category": string },
    "vinted": { "title": string, "category": string }
  },
  "warnings": [ ...any caveats ]
}
Base prices on current UK resale market values. Be specific about the model/pressing/edition.`;

  const userContent: Parameters<typeof openai.chat.completions.create>[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: hint
        ? `Analyse this ${lensLabel} for resale. Additional context: ${hint}`
        : `Analyse this ${lensLabel} for resale.`,
    },
    ...imageContent(photoUrls),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 1200,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as Record<string, unknown>;
}

async function runGuardAnalysis(
  lens: string,
  url?: string,
  screenshotUrls?: string[],
): Promise<Record<string, unknown>> {
  const openai = getOpenAIClient();
  const lensLabel = lens === "RecordLens" ? "vinyl record" : "item";

  const systemPrompt = `You are an expert fraud and risk analyst for second-hand ${lensLabel} listings. Analyse the provided listing URL and/or screenshots and return ONLY valid JSON conforming exactly to this schema (no markdown, no code fences):
{
  "mode": "guard",
  "lens": "${lens}",
  "risk": { "level": "low"|"medium"|"medium_high"|"high"|"inconclusive", "confidence": 0-1 },
  "red_flags": [{ "severity": "low"|"medium"|"high", "type": string, "message": string }],
  "missing_photos": [ ...strings listing photos that would help verify authenticity ],
  "seller_questions": [ ...3-5 questions the buyer should ask the seller ],
  "disclaimer": "AI-assisted risk screen, not formal authentication."
}
Be specific. If screenshots look stock or inconsistent, flag it. If price is anomalously low, flag it.`;

  const userParts: Parameters<typeof openai.chat.completions.create>[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: url
        ? `Check this listing for fraud/risk signals. Listing URL: ${url}`
        : `Check this listing for fraud/risk signals.`,
    },
    ...imageContent(screenshotUrls ?? []),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userParts },
    ],
    max_tokens: 1000,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as Record<string, unknown>;
}

interface XaiRecordExtraction {
  artist?: string;
  title?: string;
  label?: string;
  catalogue_number?: string;
  matrix?: string;
  additional_details?: string;
}

async function extractRecordDetailsFromImage(
  labelUrls: string[],
  matrixUrls: string[] = [],
): Promise<XaiRecordExtraction> {
  const xai = getXaiClient();

  const systemPrompt = `You are an expert in vinyl record identification. Examine the label photo(s) and extract the following details. Return ONLY valid JSON (no markdown):
{
  "artist": string|null,
  "title": string|null,
  "label": string|null,
  "catalogue_number": string|null,
  "matrix": string|null,
  "additional_details": string|null
}
Be precise. Read text exactly as it appears on the label. If a field is not visible, return null.`;

  const images = [...imageContent(labelUrls), ...imageContent(matrixUrls)];
  const userContent: Parameters<typeof xai.chat.completions.create>[0]["messages"][0]["content"] = [
    { type: "text", text: "Extract vinyl record identification details from these label/matrix photos." },
    ...images,
  ];

  const completion = await xai.chat.completions.create({
    model: "grok-2-vision-latest",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as XaiRecordExtraction;
}

function enrichMatchWithDiscogs(
  match: Record<string, unknown>,
  release: DiscogsRelease,
  searchResult?: { cover_image?: string; thumb?: string },
): Record<string, unknown> {
  const primaryImage = release.images?.find((i) => i.type === "primary");
  return {
    ...match,
    discogs: {
      release_id: release.id,
      tracklist: release.tracklist?.map((t) => `${t.position}. ${t.title}${t.duration ? ` (${t.duration})` : ""}`) ?? [],
      formats: release.formats?.map((f) => `${f.name}${f.descriptions?.length ? ` (${f.descriptions.join(", ")})` : ""}`) ?? [],
      year: release.year,
      country: release.country,
      community_have: release.community?.have ?? null,
      community_want: release.community?.want ?? null,
      community_rating: release.community?.rating?.average ?? null,
      lowest_price: release.lowest_price ?? null,
      num_for_sale: release.num_for_sale ?? null,
      cover_image: primaryImage?.uri ?? searchResult?.cover_image ?? null,
    },
  };
}

async function identifyRecord(
  labelUrls: string[],
  matrixUrls: string[] = [],
): Promise<Record<string, unknown>> {
  const hasMatrix = matrixUrls.length > 0;

  let extracted: XaiRecordExtraction = {};
  try {
    extracted = await extractRecordDetailsFromImage(labelUrls, matrixUrls);
    logger.info({ extracted }, "xAI record extraction");
  } catch (err) {
    logger.error({ err }, "xAI record extraction failed");
  }

  const searchResults = await searchDiscogs({
    artist: extracted.artist,
    title: extracted.title,
    catno: extracted.catalogue_number,
    label: extracted.label,
  });

  const topSearchResult = searchResults[0];
  const altSearchResults = searchResults.slice(1, 3);

  let topRelease: DiscogsRelease | null = null;
  if (topSearchResult) {
    topRelease = await getDiscogsRelease(topSearchResult.id);
  }

  const topArtist = topRelease?.artists?.[0]?.name ?? extracted.artist ?? null;
  const topTitle = topRelease?.title ?? extracted.title ?? null;
  const topLabel = topRelease?.labels?.[0]?.name ?? extracted.label ?? null;
  const topCatno = topRelease?.labels?.[0]?.catno ?? extracted.catalogue_number ?? null;

  let topMatch: Record<string, unknown> = {
    artist: topArtist,
    title: topTitle,
    label: topLabel,
    catalogue_number: topCatno,
    likely_release: [
      topRelease?.year ? `${topRelease.year}` : null,
      topRelease?.country ?? null,
      topRelease?.formats?.[0]?.name ?? null,
      extracted.matrix ? `Matrix: ${extracted.matrix}` : null,
    ]
      .filter(Boolean)
      .join(", ") || "Unknown pressing",
    likelihood_percent: topSearchResult ? 75 : 40,
    evidence: [
      extracted.artist ? `Artist "${extracted.artist}" read from label` : null,
      extracted.catalogue_number ? `Catalogue number "${extracted.catalogue_number}" read from label` : null,
      topRelease ? `Matched Discogs release #${topRelease.id}` : null,
      extracted.matrix ? `Matrix: ${extracted.matrix}` : null,
    ].filter(Boolean) as string[],
  };

  if (topRelease && topSearchResult) {
    topMatch = enrichMatchWithDiscogs(topMatch, topRelease, topSearchResult);
  }

  const alternateMatches: Record<string, unknown>[] = await Promise.all(
    altSearchResults.map(async (sr, idx) => {
      const release = await getDiscogsRelease(sr.id).catch(() => null);
      const artist = release?.artists?.[0]?.name ?? sr.title?.split(" - ")[0] ?? null;
      const title = release?.title ?? sr.title?.split(" - ")[1] ?? null;
      let match: Record<string, unknown> = {
        artist,
        title,
        label: release?.labels?.[0]?.name ?? (sr.label ?? [null])[0],
        catalogue_number: release?.labels?.[0]?.catno ?? sr.catno ?? null,
        likely_release: [sr.year, sr.country, (sr.format ?? [])[0]].filter(Boolean).join(", ") || "Alternate pressing",
        likelihood_percent: Math.max(10, 40 - idx * 15),
        evidence: [`Alternate Discogs match #${sr.id}`],
      };
      if (release) {
        match = enrichMatchWithDiscogs(match, release, sr);
      }
      return match;
    }),
  );

  const needsMatrix = !hasMatrix && !extracted.matrix;
  const matrixQuestions = needsMatrix
    ? [
        "What does the matrix / runout etching read on Side A?",
        "What does the matrix / runout etching read on Side B?",
      ]
    : [];

  return {
    mode: "recordlens.identify",
    lens: "RecordLens",
    input_type: hasMatrix ? "label_and_matrix" : "single_label_photo",
    top_match: topMatch,
    alternate_matches: alternateMatches,
    needs_matrix_for_clarification: needsMatrix,
    matrix_clarification_questions: matrixQuestions,
    warnings: topSearchResult
      ? []
      : ["Could not find a Discogs match — result is based on label reading only."],
    disclaimer:
      "AI-assisted release identification — confirm pressing details before listing or buying.",
  };
}

router.post("/items", (req, res) => {
  const b = body(req);
  const id = newId("item");
  const lens = (b["lens"] as string) ?? "ShoeLens";
  const marketplace = b["marketplace"] as string | undefined;
  const photoUrls = (b["photoUrls"] as string[]) ?? [];
  itemMeta.set(id, { lens, marketplace, photoUrls });
  res.json({ id, lens, marketplace, status: "draft" });
});

router.post("/items/:id/analyse", async (req, res) => {
  const { id } = req.params;
  const b = body(req);
  const meta = itemMeta.get(id) ?? {};
  const lens = (b["lens"] as string) ?? meta.lens ?? "ShoeLens";
  const hint = (b["hint"] as string) ?? meta.hint;
  const photoUrls = (b["photoUrls"] as string[]) ?? meta.photoUrls ?? [];

  try {
    const analysis = await runStudioAnalysis(lens, photoUrls, hint);
    studioStore.set(id, analysis);
    res.json({ analysis });
  } catch (err) {
    logger.error({ err, id }, "Studio analysis failed");
    res.status(500).json({ error: "Studio analysis failed. Please try again." });
  }
});

router.get("/items/:id/analysis", (req, res) => {
  const { id } = req.params;
  const analysis = studioStore.get(id);
  if (!analysis) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ analysis });
});

router.post("/items/:id/export/vinted", (req, res) => {
  const { id } = req.params;
  const analysis = studioStore.get(id);
  const vinted =
    (analysis?.["marketplace_outputs"] as
      | { vinted?: Record<string, unknown> }
      | undefined)?.vinted ?? {};
  const title = String(vinted["title"] ?? "ListLens item");
  const category = String(vinted["category"] ?? "Other");
  const price = String(
    (analysis?.["pricing"] as { recommended?: number } | undefined)
      ?.recommended ?? 0,
  );
  const csv = [
    "title,category,price,currency,description",
    [
      JSON.stringify(title),
      JSON.stringify(category),
      price,
      "GBP",
      JSON.stringify("Exported from Mr.FLENS · List-LENS."),
    ].join(","),
    "",
  ].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="vinted-${id}.csv"`,
  );
  res.send(csv);
});

router.post("/items/:id/publish/ebay-sandbox", (_req, res) => {
  const sandboxListingId = `EBAY-SBX-${Date.now().toString(36).toUpperCase()}`;
  res.json({
    ok: true,
    sandboxListingId,
    listing_url: `https://sandbox.ebay.co.uk/itm/${sandboxListingId}`,
    message: "eBay sandbox publish — no real listing was created.",
  });
});

router.post("/guard/checks", (req, res) => {
  const b = body(req);
  const id = newId("guard");
  guardMeta.set(id, {
    url: b["url"] as string,
    screenshotUrls: b["screenshotUrls"] as string[],
    lens: b["lens"] as string,
  });
  res.json({ id });
});

router.get("/guard/checks/:id", (req, res) => {
  const { id } = req.params;
  const report = guardStore.get(id);
  if (!report) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ id, report });
});

router.post("/guard/checks/:id/analyse", async (req, res) => {
  const { id } = req.params;
  const meta = guardMeta.get(id) ?? {};
  try {
    const report = await runGuardAnalysis(
      meta.lens ?? "ShoeLens",
      meta.url,
      meta.screenshotUrls,
    );
    guardStore.set(id, report);
    res.json({ id, report });
  } catch (err) {
    logger.error({ err, id }, "Guard analysis failed");
    res.status(500).json({ error: "Guard analysis failed. Please try again." });
  }
});

router.post("/guard/checks/:id/save", (_req, res) => {
  res.json({ ok: true });
});

router.post("/lenses/record/identify", async (req, res) => {
  const b = body(req);
  const labelUrls = (b["labelUrls"] as string[]) ?? [];
  try {
    const analysis = await identifyRecord(labelUrls, []);
    res.json({ analysis: { ...analysis, input_type: "single_label_photo" } });
  } catch (err) {
    logger.error({ err }, "RecordLens identify failed");
    res.status(500).json({ error: "Record identification failed. Please try again." });
  }
});

router.post("/lenses/record/identify-with-matrix", async (req, res) => {
  const b = body(req);
  const labelUrls = (b["labelUrls"] as string[]) ?? [];
  const matrixUrls = (b["matrixUrls"] as string[]) ?? [];
  try {
    const analysis = await identifyRecord(labelUrls, matrixUrls);
    res.json({ analysis: { ...analysis, input_type: "label_and_matrix" } });
  } catch (err) {
    logger.error({ err }, "RecordLens identify-with-matrix failed");
    res.status(500).json({ error: "Record identification failed. Please try again." });
  }
});

router.get("/lenses", (_req, res) => {
  res.json({ lenses: ["ShoeLens", "RecordLens"] });
});

router.post("/billing/checkout", (_req, res) => {
  res.redirect(303, "/billing?demo=checkout");
});
router.post("/billing/portal", (_req, res) => {
  res.redirect(303, "/billing?demo=portal");
});

export default router;
