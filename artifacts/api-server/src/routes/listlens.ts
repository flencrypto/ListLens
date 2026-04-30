import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { getXaiClient, getOpenAIClient } from "../lib/ai-clients";
import { searchDiscogs, getDiscogsRelease } from "../lib/discogs";
import type { DiscogsRelease } from "../lib/discogs";
import { db, studioItemsTable, guardChecksTable } from "@workspace/db";

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

function imageContent(
  urls: string[],
): { type: "image_url"; image_url: { url: string } }[] {
  return urls
    .filter(Boolean)
    .map((url) => ({ type: "image_url" as const, image_url: { url } }));
}

const StudioOutputSchema = z.object({
  mode: z.literal("studio"),
  lens: z.string(),
  listing_description: z.string().default(""),
  identity: z.object({
    brand: z.string().nullable(),
    model: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  attributes: z.record(z.unknown()),
  missing_photos: z.array(z.string()),
  pricing: z.object({
    quick_sale: z.number(),
    recommended: z.number(),
    high: z.number(),
    currency: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  marketplace_outputs: z.object({
    ebay: z.record(z.unknown()),
    vinted: z.record(z.unknown()),
  }),
  warnings: z.array(z.string()),
});

const GuardOutputSchema = z.object({
  mode: z.literal("guard"),
  lens: z.string(),
  risk: z.object({
    level: z.enum(["low", "medium", "medium_high", "high", "inconclusive"]),
    confidence: z.number().min(0).max(1),
  }),
  red_flags: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      type: z.string(),
      message: z.string(),
    }),
  ),
  missing_photos: z.array(z.string()),
  seller_questions: z.array(z.string()),
  disclaimer: z.literal("AI-assisted risk screen, not formal authentication."),
});

const LENS_META: Record<
  string,
  { label: string; category: string; attributeHints: string }
> = {
  ShoeLens: {
    label: "shoe/sneaker",
    category: "Clothes, Shoes & Accessories > Men's Shoes",
    attributeHints:
      "size (UK/EU/US), colourway, style_code, sole_condition, upper_condition, box_included",
  },
  RecordLens: {
    label: "vinyl record",
    category: "Music > Records",
    attributeHints:
      "artist, title, label, catalogue_number, pressing, format, sleeve_grade, media_grade",
  },
  LPLens: {
    label: "LP vinyl album",
    category: "Music > Records > Albums",
    attributeHints:
      "artist, album_title, label, catalogue_number, year, pressing_country, sleeve_grade, media_grade, matrix_runout",
  },
  ClothingLens: {
    label: "clothing item",
    category: "Clothes, Shoes & Accessories",
    attributeHints:
      "brand, size_label, size_numeric (chest/waist/length in cm), material, colour, style, condition_tags (pilling/fading/staining), era/vintage",
  },
  CardLens: {
    label: "trading card",
    category: "Collectables > Trading Cards",
    attributeHints:
      "card_name, set_name, set_number, rarity, language, edition (1st/unlimited), grade (PSA/BGS/CGC if applicable), centering, surface_condition, corner_condition",
  },
  ToyLens: {
    label: "toy or collectible",
    category: "Toys & Games > Action Figures & Dolls",
    attributeHints:
      "brand, product_name, year, completeness (parts/accessories present), packaging (boxed/loose/sealed), reproduction_risk_notes, play_wear_notes",
  },
  WatchLens: {
    label: "watch or timepiece",
    category: "Jewellery & Watches > Watches",
    attributeHints:
      "brand, model_reference, movement_type (manual/auto/quartz), case_material, dial_colour, bezel_type, bracelet_type, case_diameter_mm, lug_width_mm, year_approx, serial_number_visible, service_history, box_papers",
  },
  MeasureLens: {
    label: "item with physical dimensions",
    category: "Clothes, Shoes & Accessories",
    attributeHints:
      "item_type, estimated_dimensions (length_cm, width_cm, height_cm, depth_cm), measurement_method (reference_object or ruler), reference_object_used, fit_notes, size_label",
  },
  MotorLens: {
    label: "vehicle or motor part",
    category: "Vehicle Parts & Accessories",
    attributeHints:
      "make, model, year, part_name, part_number, oem_or_aftermarket, fitment_vehicles, condition_notes, mileage (if full vehicle), service_history_present",
  },
};

function getLensMeta(
  lens: string,
): { label: string; category: string; attributeHints: string } {
  return (
    LENS_META[lens] ?? {
      label: "item",
      category: "Everything Else",
      attributeHints: "key attributes relevant to this item",
    }
  );
}

function buildLensSystemPrompt(lens: string): string {
  const meta = getLensMeta(lens);
  return `You are an expert resale analyst specialising in ${meta.label}s. Analyse the provided photos and return ONLY valid JSON conforming exactly to this schema (no markdown, no code fences):
{
  "mode": "studio",
  "lens": "${lens}",
  "listing_description": "2-3 sentence honest description of the item's condition and key features, written in first person for eBay/Vinted",
  "identity": { "brand": string|null, "model": string|null, "confidence": 0-1 },
  "attributes": { ${meta.attributeHints} },
  "missing_photos": [ ...strings listing missing shots needed for a complete listing ],
  "pricing": { "quick_sale": number, "recommended": number, "high": number, "currency": "GBP", "confidence": 0-1 },
  "marketplace_outputs": {
    "ebay": { "title": string (max 80 chars), "condition": string, "category": "${meta.category}" },
    "vinted": { "title": string (max 60 chars), "category": string }
  },
  "warnings": [ ...any caveats about authenticity, condition or pricing confidence ]
}
Base prices on current UK resale market values. Be specific — name the exact model, colourway, edition or pressing.`;
}

async function runStudioAnalysis(
  lens: string,
  photoUrls: string[],
  hint?: string,
): Promise<z.infer<typeof StudioOutputSchema>> {
  const openai = getOpenAIClient();
  const { label: lensLabel } = getLensMeta(lens);

  const systemPrompt = buildLensSystemPrompt(lens);

  const userContent: Parameters<
    typeof openai.chat.completions.create
  >[0]["messages"][0]["content"] = [
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
  const parsed = JSON.parse(raw) as unknown;
  const validated = StudioOutputSchema.parse(parsed);
  return validated;
}

async function runGuardAnalysis(
  lens: string,
  url?: string,
  screenshotUrls?: string[],
): Promise<z.infer<typeof GuardOutputSchema>> {
  const openai = getOpenAIClient();
  const { label: lensLabel } = getLensMeta(lens);

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

  const userParts: Parameters<
    typeof openai.chat.completions.create
  >[0]["messages"][0]["content"] = [
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
  const parsed = JSON.parse(raw) as unknown;
  const validated = GuardOutputSchema.parse(parsed);
  return validated;
}

interface XaiRecordExtraction {
  artist?: string | null;
  title?: string | null;
  label?: string | null;
  catalogue_number?: string | null;
  matrix?: string | null;
  additional_details?: string | null;
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
  const userContent: Parameters<
    typeof xai.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: "Extract vinyl record identification details from these label/matrix photos.",
    },
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
      tracklist:
        release.tracklist?.map(
          (t) =>
            `${t.position}. ${t.title}${t.duration ? ` (${t.duration})` : ""}`,
        ) ?? [],
      formats:
        release.formats?.map(
          (f) =>
            `${f.name}${f.descriptions?.length ? ` (${f.descriptions.join(", ")})` : ""}`,
        ) ?? [],
      year: release.year,
      country: release.country,
      community_have: release.community?.have ?? null,
      community_want: release.community?.want ?? null,
      community_rating: release.community?.rating?.average ?? null,
      lowest_price: release.lowest_price ?? null,
      num_for_sale: release.num_for_sale ?? null,
      cover_image:
        primaryImage?.uri ?? searchResult?.cover_image ?? null,
    },
  };
}

async function identifyRecord(
  labelUrls: string[],
  matrixUrls: string[] = [],
): Promise<Record<string, unknown>> {
  const hasMatrix = matrixUrls.length > 0;

  // xAI extraction — hard-fail so the route returns 500 on model errors
  const extracted = await extractRecordDetailsFromImage(labelUrls, matrixUrls);
  logger.info({ extracted }, "xAI record extraction");

  // Discogs search — soft-degrade (errors already caught inside searchDiscogs)
  const searchResults = await searchDiscogs({
    artist: extracted.artist,
    title: extracted.title,
    catno: extracted.catalogue_number,
    label: extracted.label,
  });

  const topSearchResult = searchResults[0];
  const altSearchResults = searchResults.slice(1, 3);

  // Discogs release fetch — soft-degrade
  let topRelease: DiscogsRelease | null = null;
  if (topSearchResult) {
    topRelease = await getDiscogsRelease(topSearchResult.id);
  }

  const topArtist =
    topRelease?.artists?.[0]?.name ?? extracted.artist ?? null;
  const topTitle = topRelease?.title ?? extracted.title ?? null;
  const topLabel = topRelease?.labels?.[0]?.name ?? extracted.label ?? null;
  const topCatno =
    topRelease?.labels?.[0]?.catno ?? extracted.catalogue_number ?? null;

  let topMatch: Record<string, unknown> = {
    artist: topArtist,
    title: topTitle,
    label: topLabel,
    catalogue_number: topCatno,
    likely_release:
      [
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
      extracted.catalogue_number
        ? `Catalogue number "${extracted.catalogue_number}" read from label`
        : null,
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
      const artist =
        release?.artists?.[0]?.name ?? sr.title?.split(" - ")[0] ?? null;
      const title =
        release?.title ?? sr.title?.split(" - ")[1] ?? null;
      let match: Record<string, unknown> = {
        artist,
        title,
        label:
          release?.labels?.[0]?.name ?? (sr.label ?? [null])[0] ?? null,
        catalogue_number:
          release?.labels?.[0]?.catno ?? sr.catno ?? null,
        likely_release:
          [sr.year, sr.country, (sr.format ?? [])[0]]
            .filter(Boolean)
            .join(", ") || "Alternate pressing",
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
      : [
          "Could not find a Discogs match — result is based on label reading only.",
        ],
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
  const userId = req.user?.id;

  try {
    const analysis = await runStudioAnalysis(lens, photoUrls, hint);
    studioStore.set(id, analysis);

    const title =
      String((analysis.marketplace_outputs?.ebay as Record<string, unknown>)?.["title"] ?? "") ||
      [analysis.identity.brand, analysis.identity.model].filter(Boolean).join(" ") ||
      "Untitled listing";

    if (userId) {
      await db.insert(studioItemsTable)
        .values({ id, userId, lens, title, status: "analysed" })
        .onConflictDoUpdate({ target: studioItemsTable.id, set: { title, status: "analysed" } })
        .catch((err) => logger.warn({ err }, "studio_items insert failed (non-fatal)"));
    }

    res.json({ analysis });
  } catch (err) {
    logger.error({ err, id }, "Studio analysis failed");
    res
      .status(500)
      .json({ error: "Studio analysis failed. Please try again." });
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
    (
      analysis?.["marketplace_outputs"] as
        | { vinted?: Record<string, unknown> }
        | undefined
    )?.vinted ?? {};
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

router.post("/items/:id/publish/ebay-sandbox", async (req, res) => {
  const { id } = req.params;
  const b = body(req);
  const title = (b["title"] as string | undefined) ?? "Untitled";
  const description = (b["description"] as string | undefined) ?? "";
  const price = Number(b["price"] ?? 0);
  const lens = (b["lens"] as string | undefined) ?? "default";

  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "You must be logged in to publish to eBay." });
    return;
  }

  try {
    const { addEbayItem, refreshEbayToken } = await import("../lib/ebay");

    const accessToken = await refreshEbayToken(userId);
    if (!accessToken) {
      res.status(403).json({
        error: "eBay account not connected. Connect your eBay account in the billing settings before publishing.",
      });
      return;
    }

    const stored = studioStore.get(id) ?? {};
    const meta = itemMeta.get(id) ?? {};

    const ebayOutput = (stored["marketplace_outputs"] as Record<string, unknown> | undefined)?.["ebay"] as Record<string, unknown> | undefined ?? {};
    const resolvedDescription = description || String(stored["listing_description"] ?? ebayOutput["description"] ?? "");
    const resolvedCondition = String(ebayOutput["condition"] ?? stored["condition"] ?? "Used");

    const photoUrls = (meta.photoUrls ?? []).filter(
      (u): u is string => typeof u === "string" && u.startsWith("http"),
    );

    const identity = stored["identity"] as
      | { brand?: string | null; model?: string | null }
      | undefined;

    const result = await addEbayItem(accessToken, {
      title,
      description: resolvedDescription,
      price,
      lens,
      condition: resolvedCondition,
      attributes: (stored["attributes"] as Record<string, unknown> | undefined) ?? {},
      identity,
      photoUrls,
    });

    if (!result) {
      res.status(502).json({ error: "eBay rejected the listing. Check your item details and try again." });
      return;
    }

    res.json({
      ok: true,
      listingId: result.itemId,
      viewItemURL: result.viewItemURL,
    });
  } catch (err) {
    logger.error({ err }, "eBay API publish error");
    res.status(500).json({ error: "Failed to publish to eBay. Please try again." });
  }
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
  const userId = req.user?.id;
  try {
    const report = await runGuardAnalysis(
      meta.lens ?? "ShoeLens",
      meta.url,
      meta.screenshotUrls,
    );
    guardStore.set(id, report);

    if (userId) {
      await db.insert(guardChecksTable)
        .values({
          id,
          userId,
          lens: meta.lens ?? "ShoeLens",
          url: meta.url ?? null,
          riskLevel: report.risk.level,
          status: "checked",
        })
        .onConflictDoUpdate({ target: guardChecksTable.id, set: { riskLevel: report.risk.level } })
        .catch((err) => logger.warn({ err }, "guard_checks insert failed (non-fatal)"));
    }

    res.json({ id, report });
  } catch (err) {
    logger.error({ err, id }, "Guard analysis failed");
    res
      .status(500)
      .json({ error: "Guard analysis failed. Please try again." });
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
    res
      .status(500)
      .json({ error: "Record identification failed. Please try again." });
  }
});

router.post("/lenses/record/identify-with-matrix", async (req, res) => {
  const b = body(req);
  const labelUrls = (b["labelUrls"] as string[]) ?? [];
  const matrixUrls = (b["matrixUrls"] as string[]) ?? [];
  try {
    const analysis = await identifyRecord(labelUrls, matrixUrls);
    res.json({
      analysis: { ...analysis, input_type: "label_and_matrix" },
    });
  } catch (err) {
    logger.error({ err }, "RecordLens identify-with-matrix failed");
    res
      .status(500)
      .json({ error: "Record identification failed. Please try again." });
  }
});

const LENS_REGISTRY_META = [
  {
    id: "RecordLens",
    name: "RecordLens",
    icon: "💿",
    category: "Music Media",
    description:
      "Vinyl, CDs and cassettes. Identifies release from a label photo, with a matrix runout clarification flow.",
    status: "live",
  },
  {
    id: "ShoeLens",
    name: "ShoeLens",
    icon: "👟",
    category: "Footwear",
    description:
      "Trainers, sneakers and shoes. Style code, size label and sole checks.",
    status: "live",
  },
  {
    id: "LPLens",
    name: "LPLens",
    icon: "🎵",
    category: "Music Media",
    description:
      "LP vinyl albums. Sleeve and media grading, matrix runout, pressing country and edition details.",
    status: "live",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens",
    icon: "👕",
    category: "Apparel",
    description:
      "Clothing, vintage garments and apparel. Size label, fit and measurements.",
    status: "live",
  },
  {
    id: "CardLens",
    name: "CardLens",
    icon: "🎴",
    category: "Trading Cards",
    description:
      "Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity and grading checks.",
    status: "live",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    icon: "🧸",
    category: "Toys & Collectibles",
    description:
      "Toys, figures and LEGO. Completeness, packaging and reproduction checks.",
    status: "live",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    icon: "⌚",
    category: "Watches",
    description:
      "Watches and timepieces. Reference, dial and provenance evidence checks.",
    status: "live",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    icon: "📐",
    category: "Measurement",
    description:
      "Physical reference object for accurate dimension estimation. Ideal for garments and parts.",
    status: "live",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    icon: "🚗",
    category: "Vehicles & Parts",
    description:
      "Vehicles, parts and campers. Image + dimension-based fitment checks.",
    status: "live",
  },
] as const;

router.get("/lenses", (_req, res) => {
  res.json({
    lenses: LENS_REGISTRY_META.map((l) => l.id),
    registry: LENS_REGISTRY_META,
  });
});

async function handleLensAnalysis(
  req: Request,
  res: Response,
  lensId: string,
): Promise<void> {
  const b = body(req);
  const photoUrls = (b["photoUrls"] as string[]) ?? [];
  const hint = b["hint"] as string | undefined;
  const metadata = b["metadata"] as Record<string, unknown> | undefined;
  const combinedHint = [
    hint,
    metadata && Object.keys(metadata).length > 0
      ? `Additional metadata: ${JSON.stringify(metadata)}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" | ") || undefined;
  try {
    const analysis = await runStudioAnalysis(lensId, photoUrls, combinedHint);
    res.json({ analysis });
  } catch (err) {
    logger.error({ err, lensId }, `${lensId} analysis failed`);
    res.status(500).json({ error: `${lensId} analysis failed. Please try again.` });
  }
}

router.post("/lenses/lp", (req, res) => handleLensAnalysis(req, res, "LPLens"));
router.post("/lenses/clothing", (req, res) => handleLensAnalysis(req, res, "ClothingLens"));
router.post("/lenses/card", (req, res) => handleLensAnalysis(req, res, "CardLens"));
router.post("/lenses/toy", (req, res) => handleLensAnalysis(req, res, "ToyLens"));
router.post("/lenses/watch", (req, res) => handleLensAnalysis(req, res, "WatchLens"));
router.post("/lenses/measure", (req, res) => handleLensAnalysis(req, res, "MeasureLens"));
router.post("/lenses/motor", (req, res) => handleLensAnalysis(req, res, "MotorLens"));

export default router;
