/**
 * RecordLens AI Analysis Pipeline
 *
 * Step 1  — Image-type classification (vision)
 * Step 2A — Batch vision extraction (catalog, matrix, barcodes, readable text)
 * Step 2B — Condition grading (media + sleeve grade, defects)  — runs in parallel with 2A
 * Step 3  — Pressing identification: Discogs fast-path → LLM fallback
 * Step 4  — Listing content generation (title, subtitle, description, SEO keywords)
 * Step 5  — Price suggestion (Discogs valuation × condition multiplier, or rules-based)
 *
 * Vision model routing: xAI (Grok) → DeepSeek → OpenAI text-only fallback
 */

import OpenAI from "openai";
import { logger } from "./logger";
import {
  searchDiscogs,
  getDiscogsRelease,
  searchDiscogsViaMatrix,
  enrichDiscogsResults,
  type DiscogsRelease,
} from "./discogs";
import {
  runRecordIdentificationAgent,
  type IdentificationInput,
  type IdentificationAgentResult,
} from "./record-identification-agent";
import {
  generateEbayListing,
  type ListingCreatorInput,
  type StyleSystem,
  type ComplianceAudit,
} from "./ebay-listing-creator-agent";
// ─── Vision model routing ─────────────────────────────────────────────────────

type VisionMode = "vision" | "text_only";

interface VisionClientInfo {
  client: OpenAI;
  model: string;
  mode: VisionMode;
}

function getVisionClientInfo(): VisionClientInfo {
  const xaiKey = process.env["XAI_API_KEY"];
  if (xaiKey) {
    return {
      client: new OpenAI({ apiKey: xaiKey, baseURL: "https://api.x.ai/v1" }),
      model: "grok-4-fast-non-reasoning",
      mode: "vision",
    };
  }

  const deepseekKey = process.env["DEEPSEEK_API_KEY"];
  if (deepseekKey) {
    return {
      client: new OpenAI({
        apiKey: deepseekKey,
        baseURL: "https://api.deepseek.com/v1",
      }),
      model: "deepseek-vision",
      mode: "vision",
    };
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      model: "gpt-4o",
      mode: "text_only",
    };
  }

  throw new Error("No AI API key configured (XAI_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY required)");
}

function buildImageContent(
  urls: string[],
  mode: VisionMode,
): { type: "image_url"; image_url: { url: string } }[] {
  if (mode === "text_only") return [];
  return urls
    .filter(Boolean)
    .map((url) => ({ type: "image_url" as const, image_url: { url } }));
}

function textOnlyFallbackNote(photoCount: number): string {
  return photoCount > 0
    ? `\n[Note: ${photoCount} photo(s) were provided but this model is text-only. Please infer from any available metadata.]`
    : "";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhotoType =
  | "front_cover"
  | "back_cover"
  | "label_side_a"
  | "label_side_b"
  | "runout_side_a"
  | "runout_side_b"
  | "inner_sleeve"
  | "other";

export interface ClassifiedPhoto {
  url: string;
  type: PhotoType;
  confidence: number;
}

export interface RecordExtraction {
  catalog_numbers: string[];
  matrix_runout_a: string | null;
  matrix_runout_b: string | null;
  label_names: string[];
  barcodes: string[];
  artist: string | null;
  title: string | null;
  year: string | null;
  country: string | null;
  readable_text: string;
}

export interface ConditionGrade {
  media_grade: string;
  sleeve_grade: string;
  defects: string[];
  grading_notes: string;
  overall_condition_summary: string;
}

export interface PressingDetails {
  artist: string | null;
  title: string | null;
  label: string | null;
  catalogue_number: string | null;
  year: string | null;
  country: string | null;
  format: string | null;
  pressing_notes: string | null;
  discogs_release_id: number | null;
  discogs_lowest_price: number | null;
  discogs_community_have: number | null;
  discogs_community_want: number | null;
  discogs_tracklist: string[];
  confidence: number;
  source: "discogs" | "llm" | "extraction_only";
}

/**
 * User-supplied corrections that override OCR extraction data.
 * When matrix fields are present they become the #1 priority Discogs search strategy.
 */
export interface AnalysisCorrections {
  matrix_a?: string;
  matrix_b?: string;
  country?: string;
  year?: string;
  catalogue_number?: string;
  label?: string;
  artist?: string;
  title?: string;
}

export interface ListingCopy {
  // Core fields — backward compatible
  seo_keywords: string[];
  title: string;
  subtitle: string;
  description: string;
  band_context: string;
  tracklist: string[];
  pressing_highlights: string[];
  // eBay HTML Listing Creator Agent fields
  html_description: string | null;
  plain_text_description: string | null;
  style_system: StyleSystem | null;
  seo_title_options: string[];
  item_specifics: Record<string, string>;
  compliance_audit: ComplianceAudit | null;
}

export interface RecordLensAnalysis {
  mode: "studio";
  lens: "RecordLens";
  listing_description: string;
  identity: {
    brand: string | null;
    model: string | null;
    confidence: number;
  };
  attributes: {
    artist: string | null;
    title: string | null;
    label: string | null;
    catalogue_number: string | null;
    year: string | null;
    country: string | null;
    pressing_format: string | null;
    sleeve_grade: string;
    media_grade: string;
    matrix_runout_a: string | null;
    matrix_runout_b: string | null;
    barcodes: string[];
    image_types_detected: string[];
  };
  missing_photos: string[];
  pricing: {
    quick_sale: number;
    recommended: number;
    high: number;
    currency: string;
    confidence: number;
  };
  marketplace_outputs: {
    ebay: {
      title: string;
      condition: string;
      category: string;
      item_specifics: Record<string, string>;
      keywords: string[];
      html_description: string | null;
      seo_title_options: string[];
    };
    vinted: {
      title: string;
      category: string;
    };
  };
  warnings: string[];
  record_analysis: {
    image_classification: ClassifiedPhoto[];
    extraction: RecordExtraction;
    condition: ConditionGrade;
    pressing: PressingDetails;
    listing_copy: ListingCopy;
    vision_model_used: string;
    pipeline_steps_completed: string[];
    needs_matrix_for_clarification: boolean;
    matrix_clarification_sides: string[];
    top_match: RankedPressing;
    alternate_matches: RankedPressing[];
  };
}

// ─── Condition multipliers for pricing ───────────────────────────────────────

const CONDITION_MULTIPLIERS: Record<string, number> = {
  "M": 1.25,
  "NM": 1.0,
  "NM-": 0.95,
  "VG+": 0.75,
  "VG": 0.50,
  "VG-": 0.40,
  "G+": 0.25,
  "G": 0.15,
  "F": 0.05,
  "P": 0.02,
};

function conditionMultiplier(grade: string): number {
  const normalised = grade.trim().toUpperCase();
  return CONDITION_MULTIPLIERS[normalised] ?? 0.5;
}

// ─── Step 1: Photo classification ────────────────────────────────────────────

async function classifyPhotos(
  photoUrls: string[],
  clientInfo: VisionClientInfo,
): Promise<ClassifiedPhoto[]> {
  if (photoUrls.length === 0) return [];
  if (photoUrls.length === 1) {
    return [{ url: photoUrls[0]!, type: "label_side_a", confidence: 0.6 }];
  }

  const systemPrompt = `You are an expert in vinyl record photography. Classify each photo by type.
Return ONLY valid JSON (no markdown):
{
  "classifications": [
    { "index": 0, "type": "front_cover|back_cover|label_side_a|label_side_b|runout_side_a|runout_side_b|inner_sleeve|other", "confidence": 0-1 }
  ]
}
Types:
- front_cover: outer sleeve front
- back_cover: outer sleeve back / track listing side
- label_side_a: vinyl label (Side A / Side 1)
- label_side_b: vinyl label (Side B / Side 2)
- runout_side_a: matrix / runout groove area (Side A)
- runout_side_b: matrix / runout groove area (Side B)
- inner_sleeve: paper or plastic inner sleeve
- other: anything else`;

  const userContent: Parameters<
    typeof clientInfo.client.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: `Classify these ${photoUrls.length} vinyl record photos by type.${
        clientInfo.mode === "text_only" ? textOnlyFallbackNote(photoUrls.length) : ""
      }`,
    },
    ...buildImageContent(photoUrls, clientInfo.mode),
  ];

  try {
    const completion = await clientInfo.client.chat.completions.create({
      model: clientInfo.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      classifications?: { index: number; type: string; confidence: number }[];
    };

    return (parsed.classifications ?? []).map((c) => ({
      url: photoUrls[c.index] ?? photoUrls[0]!,
      type: (c.type as PhotoType) ?? "other",
      confidence: c.confidence ?? 0.5,
    }));
  } catch (err) {
    logger.warn({ err }, "Photo classification failed — using positional heuristics");
    return photoUrls.map((url, i) => ({
      url,
      type: i === 0 ? "front_cover" : i === 1 ? "label_side_a" : "other",
      confidence: 0.4,
    }));
  }
}

// ─── Step 2A: Batch vision extraction ────────────────────────────────────────

async function extractRecordDetails(
  photoUrls: string[],
  clientInfo: VisionClientInfo,
): Promise<RecordExtraction> {
  const systemPrompt = `You are a specialist vinyl record data extractor. Examine ALL photos with extreme care and extract every piece of identifying text. Return ONLY valid JSON (no markdown):
{
  "catalog_numbers": [ ...ALL catalogue/catalog numbers — typically printed on the label near the centre hole or on the label ring, e.g. "POLD 5046", "2383 449", "AWL 1002", "XLLP780" ],
  "matrix_runout_a": "exact text hand-etched or stamped in the dead wax groove area (runout) on Side A — copy character-for-character or null",
  "matrix_runout_b": "exact text hand-etched or stamped in the dead wax groove area (runout) on Side B — copy character-for-character or null",
  "label_names": [ ...ALL record label names visible, e.g. "Polydor", "Harvest", "XL Recordings" ],
  "barcodes": [ ...any barcode or EAN numbers ],
  "artist": "artist name exactly as printed or null",
  "title": "album or single title exactly as printed or null",
  "year": "year printed on label as string or null",
  "country": "country of manufacture if stated, e.g. 'Made in England', 'Made in EU' — extract the country name or null",
  "readable_text": "all other text visible on labels and sleeves verbatim — include pressing plant codes, copyright notices, producer credits, track listings etc."
}

CRITICAL RULES:
- Catalogue numbers are MANDATORY to extract if visible — look at the label edge/ring, below the title, and near the spindle hole
- Copy ALL text exactly as printed — do not paraphrase or abbreviate
- A catalogue number that looks like 'POLY 238' may actually be a label code; also read surrounding text carefully
- If the label shows both a matrix and a catalogue number, report both separately
- Include ALL catalog numbers you see, even if they appear to be alternates or matrix-derived`;

  const userContent: Parameters<
    typeof clientInfo.client.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: `Extract all identifying information from these vinyl record photos.${
        clientInfo.mode === "text_only" ? textOnlyFallbackNote(photoUrls.length) : ""
      }`,
    },
    ...buildImageContent(photoUrls, clientInfo.mode),
  ];

  const completion = await clientInfo.client.chat.completions.create({
    model: clientInfo.model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 1000,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<RecordExtraction> = {};
  try {
    parsed = JSON.parse(raw) as Partial<RecordExtraction>;
  } catch (err) {
    logger.warn({ err, raw: raw.slice(0, 200) }, "extractRecordDetails JSON.parse failed — using empty extraction");
  }
  return {
    catalog_numbers: parsed.catalog_numbers ?? [],
    matrix_runout_a: parsed.matrix_runout_a ?? null,
    matrix_runout_b: parsed.matrix_runout_b ?? null,
    label_names: parsed.label_names ?? [],
    barcodes: parsed.barcodes ?? [],
    artist: parsed.artist ?? null,
    title: parsed.title ?? null,
    year: parsed.year ?? null,
    country: parsed.country ?? null,
    readable_text: parsed.readable_text ?? "",
  };
}

// ─── Step 2B: Condition grading ───────────────────────────────────────────────

async function gradeCondition(
  photoUrls: string[],
  clientInfo: VisionClientInfo,
): Promise<ConditionGrade> {
  const systemPrompt = `You are an expert vinyl record grader using the Goldmine grading standard. Examine the photos of the record and sleeve carefully.

Return ONLY valid JSON (no markdown):
{
  "media_grade": "M|NM|NM-|VG+|VG|VG-|G+|G|F|P",
  "sleeve_grade": "M|NM|NM-|VG+|VG|VG-|G+|G|F|P",
  "defects": [ ...list of specific defects visible: scratches, scuffs, ring wear, seam splits, writing, stickers etc. ],
  "grading_notes": "seller-facing honest description of condition, 2-3 sentences",
  "overall_condition_summary": "one-line summary for listing title use"
}

Grading guide:
- M (Mint): Absolutely perfect in every way, never played
- NM (Near Mint): Nearly perfect, barely any signs of play
- VG+ (Very Good Plus): Shows some signs of play, plays perfectly with slight surface noise
- VG (Very Good): Obvious signs of handling, some light scratches, surface noise present
- G+ (Good Plus): Heavy wear but plays through without skipping
- G (Good): Very heavy wear, plays through with noise
If sleeve is missing or not visible, return "Not graded" for sleeve_grade.`;

  const userContent: Parameters<
    typeof clientInfo.client.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: `Grade the physical condition of this vinyl record and sleeve.${
        clientInfo.mode === "text_only" ? textOnlyFallbackNote(photoUrls.length) : ""
      }`,
    },
    ...buildImageContent(photoUrls, clientInfo.mode),
  ];

  const completion = await clientInfo.client.chat.completions.create({
    model: clientInfo.model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<ConditionGrade> = {};
  try {
    parsed = JSON.parse(raw) as Partial<ConditionGrade>;
  } catch (err) {
    logger.warn({ err, raw: raw.slice(0, 200) }, "gradeCondition JSON.parse failed — using VG+ defaults");
  }
  return {
    media_grade: parsed.media_grade ?? "VG+",
    sleeve_grade: parsed.sleeve_grade ?? "VG+",
    defects: parsed.defects ?? [],
    grading_notes: parsed.grading_notes ?? "",
    overall_condition_summary: parsed.overall_condition_summary ?? "",
  };
}

// ─── Step 3: Pressing identification ─────────────────────────────────────────

export interface RankedPressing {
  artist: string | null;
  title: string | null;
  label: string | null;
  catalogue_number: string | null;
  likely_release: string;
  likelihood_percent: number;
  evidence: string[];
}

async function discogsSearchWithFallback(
  artist: string | null,
  title: string | null,
  catno: string | null,
  label: string | null,
): Promise<DiscogsSearchResult[]> {
  // Strategy: progressively relax constraints until we get results.
  // Label names from OCR are often wrong/abbreviated — drop them first.
  // Catno-only is the final fallback: a catalogue number uniquely identifies a
  // release within a label and is usually readable even when artist/title text
  // is stylised or partially obscured.
  const attempts: Array<Parameters<typeof searchDiscogs>[0]> = [
    { artist, title, catno, label },
    { artist, title, catno, label: null },
    { artist, title, catno: null, label: null },
    ...(catno ? [{ artist: null, title: null, catno, label: null }] : []),
  ];
  for (const q of attempts) {
    const results = await searchDiscogs(q).catch(() => []);
    if (results.length) return results;
  }
  return [];
}

function buildReleaseFormat(release: DiscogsRelease): string | null {
  return (
    release.formats
      ?.map((f) => [f.name, ...(f.descriptions ?? [])].filter(Boolean).join(", "))
      .join("; ") ?? null
  );
}

function buildReleaseTracklist(release: DiscogsRelease): string[] {
  return (
    release.tracklist?.map(
      (t) => `${t.position}. ${t.title}${t.duration ? ` (${t.duration})` : ""}`,
    ) ?? []
  );
}

async function identifyPressingViaDiscogs(
  extraction: RecordExtraction,
): Promise<{ top: PressingDetails | null; alternates: RankedPressing[]; enrichedReleases: DiscogsRelease[] }> {
  const searchResults = await discogsSearchWithFallback(
    extraction.artist,
    extraction.title,
    extraction.catalog_numbers[0] ?? null,
    extraction.label_names[0] ?? null,
  );

  if (!searchResults.length) return { top: null, alternates: [], enrichedReleases: [] };

  // Enrich top 4 results in parallel — gives the Identification Agent full
  // year / country / format / tracklist data for every candidate, not just #1.
  const topResults = searchResults.slice(0, 4);
  const enrichedReleases = await enrichDiscogsResults(topResults.map((sr) => sr.id));

  const release = enrichedReleases[0] ?? null;

  const artist = release?.artists?.[0]?.name ?? extraction.artist ?? null;
  const title = release?.title ?? extraction.title ?? null;
  const label = release?.labels?.[0]?.name ?? extraction.label_names[0] ?? null;
  const catno = release?.labels?.[0]?.catno ?? extraction.catalog_numbers[0] ?? null;

  const hasMatrix = !!(extraction.matrix_runout_a || extraction.matrix_runout_b);

  const top: PressingDetails | null = release
    ? {
        artist,
        title,
        label,
        catalogue_number: catno,
        year: release.year ? String(release.year) : extraction.year,
        country: release.country ?? extraction.country ?? null,
        format: buildReleaseFormat(release),
        pressing_notes: release.notes ?? null,
        discogs_release_id: release.id,
        discogs_lowest_price: release.lowest_price ?? null,
        discogs_community_have: release.community?.have ?? null,
        discogs_community_want: release.community?.want ?? null,
        discogs_tracklist: buildReleaseTracklist(release),
        // Without matrix evidence, confidence is capped at 0.65 so that ambiguous
        // pressings (multiple versions on same label/catno) always trigger clarification.
        confidence: hasMatrix ? 0.88 : 0.65,
        source: "discogs",
      }
    : null;

  // Build display-level alternates from the remaining enriched results
  const alternates: RankedPressing[] = enrichedReleases.slice(1).map((altRelease, idx) => {
    const sr = topResults[idx + 1]!;
    const altYear = altRelease.year ? String(altRelease.year) : (sr.year ?? null);
    const altCountry = altRelease.country ?? sr.country ?? null;
    const altFormat = buildReleaseFormat(altRelease) ?? (sr.format ?? [])[0] ?? null;
    return {
      artist: altRelease.artists?.[0]?.name ?? sr.title?.split(" - ")[0] ?? null,
      title: altRelease.title ?? sr.title?.split(" - ")[1] ?? null,
      label: altRelease.labels?.[0]?.name ?? null,
      catalogue_number: altRelease.labels?.[0]?.catno ?? sr.catno ?? null,
      likely_release: [altYear, altCountry, altFormat].filter(Boolean).join(", ") || "Alternate pressing",
      likelihood_percent: Math.max(8, 35 - idx * 10),
      evidence: [`Discogs alternate match #${sr.id}`],
    } satisfies RankedPressing;
  });

  return { top, alternates, enrichedReleases };
}

/**
 * identifyPressingViaIdentificationAgent — replaces the old monolithic LLM prompt.
 *
 * Uses the Record Identification Intelligence Agent to:
 *  - Score and re-rank Discogs candidates against OCR evidence
 *  - Apply the evidence hierarchy (matrix > catno > label > year/country)
 *  - Detect conflicts between OCR data and Discogs results
 *  - Return % likelihood, missing evidence prompts, and bootleg risk
 *
 * Discogs candidates from a prior search are passed in so the agent can
 * adjudicate between them rather than guessing from scratch.
 */
async function identifyPressingViaIdentificationAgent(
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
  discogsCandidates: Array<{
    release_id: number;
    artist: string | null;
    title: string | null;
    label: string | null;
    catno: string | null;
    year: string | null;
    country: string | null;
    format: string | null;
  }> = [],
): Promise<{ pressing: PressingDetails; agentResult: IdentificationAgentResult }> {
  const input: IdentificationInput = {
    artist: extraction.artist,
    title: extraction.title,
    label: extraction.label_names[0] ?? null,
    catalogue_number: extraction.catalog_numbers[0] ?? null,
    matrix_side_a: extraction.matrix_runout_a,
    matrix_side_b: extraction.matrix_runout_b,
    barcodes: extraction.barcodes,
    year: extraction.year,
    country: extraction.country,
    readable_text: extraction.readable_text,
    discogs_candidates: discogsCandidates,
  };

  const agentResult = await runRecordIdentificationAgent(
    input,
    clientInfo.client,
    clientInfo.model,
  );

  const top = agentResult.candidates[0];

  const pressing: PressingDetails = {
    artist: top?.artist ?? extraction.artist,
    title: top?.title ?? extraction.title,
    label: top?.label ?? extraction.label_names[0] ?? null,
    catalogue_number: top?.catalogue_number ?? extraction.catalog_numbers[0] ?? null,
    year: top?.year ?? extraction.year,
    country: top?.country ?? extraction.country,
    format: top?.format ?? null,
    pressing_notes: top?.pressing_notes ?? null,
    discogs_release_id: null,
    discogs_lowest_price: null,
    discogs_community_have: null,
    discogs_community_want: null,
    discogs_tracklist: [],
    confidence: top ? top.likelihood_percent / 100 : 0.4,
    source: "llm",
  };

  return { pressing, agentResult };
}

async function identifyPressing(
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
  corrections?: AnalysisCorrections,
): Promise<{ pressing: PressingDetails; alternates: RankedPressing[]; stepsCompleted: string[] }> {
  const steps: string[] = [];

  // Apply user corrections — these always override OCR extraction data
  if (corrections) {
    if (corrections.matrix_a?.trim()) extraction.matrix_runout_a = corrections.matrix_a.trim();
    if (corrections.matrix_b?.trim()) extraction.matrix_runout_b = corrections.matrix_b.trim();
    if (corrections.country?.trim()) extraction.country = corrections.country.trim();
    if (corrections.year?.trim()) extraction.year = corrections.year.trim();
    if (corrections.catalogue_number?.trim()) {
      extraction.catalog_numbers = [corrections.catalogue_number.trim(), ...extraction.catalog_numbers.filter((c) => c !== corrections.catalogue_number!.trim())];
    }
    if (corrections.label?.trim()) {
      extraction.label_names = [corrections.label.trim(), ...extraction.label_names.filter((l) => l !== corrections.label!.trim())];
    }
    if (corrections.artist?.trim()) extraction.artist = corrections.artist.trim();
    if (corrections.title?.trim()) extraction.title = corrections.title.trim();
    steps.push("user_corrections_applied");
  }

  // ── PRIORITY 1: Matrix-text Discogs search ─────────────────────────────────
  // Matrix/runout etchings are the most definitive pressing evidence.
  // When the user provides matrix corrections we search by matrix text first —
  // this cuts through ambiguous label/catno matches and pinpoints the exact pressing.
  const hasMatrixCorrection = !!(corrections?.matrix_a?.trim() || corrections?.matrix_b?.trim());
  if (hasMatrixCorrection) {
    const matrixQuery = [corrections!.matrix_a, corrections!.matrix_b].filter(Boolean).join(" ");
    steps.push("matrix_priority_discogs_search");
    logger.info({ matrixQuery: matrixQuery.slice(0, 80) }, "Matrix correction provided — running matrix-priority Discogs search");

    const matrixResults = await searchDiscogsViaMatrix(matrixQuery);
    if (matrixResults.length) {
      steps.push("matrix_search_found");
      const topResult = matrixResults[0]!;
      const release = await getDiscogsRelease(topResult.id).catch(() => null);
      if (release) {
        const artist = release.artists?.[0]?.name ?? extraction.artist ?? null;
        const title = release.title ?? extraction.title ?? null;
        const label = release.labels?.[0]?.name ?? extraction.label_names[0] ?? null;
        const catno = release.labels?.[0]?.catno ?? extraction.catalog_numbers[0] ?? null;
        const tracklist = release.tracklist?.map((t) => `${t.position}. ${t.title}${t.duration ? ` (${t.duration})` : ""}`) ?? [];
        const format = release.formats?.map((f) => [f.name, ...(f.descriptions ?? [])].filter(Boolean).join(", ")).join("; ") ?? null;

        const pressing: PressingDetails = {
          artist, title, label,
          catalogue_number: catno,
          year: release.year ? String(release.year) : extraction.year,
          country: release.country ?? extraction.country ?? null,
          format,
          pressing_notes: release.notes ?? null,
          discogs_release_id: release.id,
          discogs_lowest_price: release.lowest_price ?? null,
          discogs_community_have: release.community?.have ?? null,
          discogs_community_want: release.community?.want ?? null,
          discogs_tracklist: tracklist,
          // Matrix match is highest possible evidence — confidence 0.95
          confidence: 0.95,
          source: "discogs",
        };

        const altResults = matrixResults.slice(1, 4);
        const alternates: RankedPressing[] = await Promise.all(
          altResults.map(async (sr, idx) => {
            const altRelease = await getDiscogsRelease(sr.id).catch(() => null);
            return {
              artist: altRelease?.artists?.[0]?.name ?? sr.title?.split(" - ")[0] ?? null,
              title: altRelease?.title ?? sr.title?.split(" - ")[1] ?? null,
              label: altRelease?.labels?.[0]?.name ?? null,
              catalogue_number: altRelease?.labels?.[0]?.catno ?? sr.catno ?? null,
              likely_release: [sr.year, sr.country, (sr.format ?? [])[0]].filter(Boolean).join(", ") || "Alternate pressing",
              likelihood_percent: Math.max(8, 30 - idx * 10),
              evidence: [`Discogs matrix search alternate #${sr.id}`],
            } satisfies RankedPressing;
          }),
        );
        return { pressing, alternates, stepsCompleted: steps };
      }
    }
    // Matrix search returned no results — fall through to standard search
    logger.info({ matrixQuery: matrixQuery.slice(0, 80) }, "Matrix Discogs search found no results — falling back to standard search");
    steps.push("matrix_search_no_results_fallback");
  }

  // ── PRIORITY 2: Standard Discogs search (with corrected extraction data) ───
  const { top: discogsTop, alternates: discogsAlternates, enrichedReleases } = await identifyPressingViaDiscogs(extraction);
  steps.push("discogs_search");

  // Only short-circuit on very high confidence (matrix-grade: 0.90+).
  // Anything below 0.90 is sent to the Identification Agent for evidence-based
  // re-ranking — this prevents silently accepting a mismatched pressing
  // (e.g. a later repress on the same label/catno when an original was expected).
  if (discogsTop && discogsTop.confidence >= 0.90) {
    steps.push("discogs_high_confidence_match");
    return { pressing: discogsTop, alternates: discogsAlternates, stepsCompleted: steps };
  }

  // ── PRIORITY 3: Identification Agent ──────────────────────────────────────
  // Always delegate to the agent when Discogs confidence < 0.90.
  // The agent scores all enriched candidates against the evidence hierarchy
  // (matrix > catno > label > year/country), so every candidate now carries
  // full year / country / format / release_id for proper disambiguation.
  logger.info(
    { discogs_found: !!discogsTop, enriched_count: enrichedReleases.length },
    "Running Identification Agent for evidence-based candidate ranking",
  );
  steps.push("identification_agent");

  // Build candidates from all enriched Discogs releases — every entry has the
  // full release data the agent needs to adjudicate between pressings.
  const discogsCandidates = enrichedReleases.map((r) => ({
    release_id: r.id,
    artist: r.artists?.[0]?.name ?? null,
    title: r.title ?? null,
    label: r.labels?.[0]?.name ?? null,
    catno: r.labels?.[0]?.catno ?? null,
    year: r.year ? String(r.year) : null,
    country: r.country ?? null,
    format: buildReleaseFormat(r),
  }));

  const { pressing: agentPressing, agentResult } = await identifyPressingViaIdentificationAgent(
    extraction,
    clientInfo,
    discogsCandidates,
  );

  // Resolve Discogs market data by matching the agent's top pick back to the
  // enriched releases. Try catalogue number first (most specific), then
  // title + year, then fall back to the highest-ranked enriched result.
  const topCandidate = agentResult.candidates[0];
  const matchedRelease =
    (topCandidate?.catalogue_number
      ? enrichedReleases.find((r) =>
          r.labels?.some(
            (l) =>
              l.catno.toLowerCase().trim() ===
              topCandidate.catalogue_number!.toLowerCase().trim(),
          ),
        )
      : undefined) ??
    (topCandidate?.title && topCandidate?.year
      ? enrichedReleases.find(
          (r) =>
            r.title?.toLowerCase() === topCandidate.title!.toLowerCase() &&
            r.year === parseInt(topCandidate.year!, 10),
        )
      : undefined) ??
    enrichedReleases[0] ??
    null;

  if (matchedRelease) {
    agentPressing.discogs_release_id = matchedRelease.id;
    agentPressing.discogs_lowest_price = matchedRelease.lowest_price ?? null;
    agentPressing.discogs_community_have = matchedRelease.community?.have ?? null;
    agentPressing.discogs_community_want = matchedRelease.community?.want ?? null;
    agentPressing.discogs_tracklist = buildReleaseTracklist(matchedRelease);
  }

  // Build alternates from the agent's ranked candidates (skip rank 1 — that's the pressing)
  const agentAlternates: RankedPressing[] = agentResult.candidates.slice(1).map((c) => ({
    artist: c.artist,
    title: c.title,
    label: c.label,
    catalogue_number: c.catalogue_number,
    likely_release: [c.year, c.country, c.format].filter(Boolean).join(", ") || (c.pressing_notes ?? "Alternate pressing"),
    likelihood_percent: c.likelihood_percent,
    evidence: c.evidence,
  }));

  // Merge with any Discogs alternates not captured by the agent
  const allAlternates: RankedPressing[] = agentAlternates.length ? agentAlternates : discogsAlternates;

  return { pressing: agentPressing, alternates: allAlternates, stepsCompleted: steps };
}

// ─── Step 4: Listing content generation ───────────────────────────────────────
//
// Uses the RecordLens eBay HTML Listing Creator Agent as the sole method for
// generating listing content. Produces collector-grade HTML, plain text,
// SEO titles, item specifics, style system, and compliance audit in one call.

async function generateListingCopy(
  pressing: PressingDetails,
  condition: ConditionGrade,
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
): Promise<ListingCopy> {
  const tracklist = pressing.discogs_tracklist.length
    ? pressing.discogs_tracklist
    : [];

  const input: ListingCreatorInput = {
    artist: pressing.artist ?? extraction.artist,
    title: pressing.title ?? extraction.title,
    format: pressing.format ?? "LP, Album",
    label: pressing.label ?? extraction.label_names[0] ?? null,
    catalogue_number: pressing.catalogue_number ?? extraction.catalog_numbers[0] ?? null,
    country: pressing.country ?? extraction.country,
    year: pressing.year ?? extraction.year,
    matrix_runout_side_a: extraction.matrix_runout_a,
    matrix_runout_side_b: extraction.matrix_runout_b,
    media_grade: condition.media_grade,
    sleeve_grade: condition.sleeve_grade,
    condition_notes: condition.grading_notes,
    defects: condition.defects,
    pressing_notes: pressing.pressing_notes,
    likely_release: pressing.pressing_notes ?? null,
    likelihood_percent: Math.round(pressing.confidence * 100),
    identification_complete: pressing.confidence >= 0.9,
    missing_evidence: [],
    conflicts: [],
    discogs_have: pressing.discogs_community_have,
    discogs_want: pressing.discogs_community_want,
    tracklist,
    front_cover_description: null,
  };

  const agentResult = await generateEbayListing(
    input,
    clientInfo.client,
    clientInfo.model,
  );

  const fallbackTitle = `${pressing.artist ?? ""} - ${pressing.title ?? ""} ${pressing.year ?? ""}`.trim();

  return {
    // Core backward-compat fields
    seo_keywords: agentResult.seo_keywords,
    title: (agentResult.seo.recommended_title ?? fallbackTitle).slice(0, 80),
    subtitle: agentResult.seo.subtitle ?? `${condition.media_grade} / ${condition.sleeve_grade}`,
    description: agentResult.plain_text_description ?? condition.grading_notes,
    band_context: "",
    tracklist: agentResult.tracklist,
    pressing_highlights: [],
    // New eBay HTML Listing Creator Agent fields
    html_description: agentResult.html_description,
    plain_text_description: agentResult.plain_text_description,
    style_system: agentResult.style_system,
    seo_title_options: agentResult.seo.title_options,
    item_specifics: agentResult.item_specifics,
    compliance_audit: agentResult.compliance_audit,
  };
}

// ─── Step 5: Price suggestion ─────────────────────────────────────────────────

interface PriceSuggestion {
  quick_sale: number;
  recommended: number;
  high: number;
  currency: string;
  confidence: number;
  basis: string;
}

function suggestPrice(
  pressing: PressingDetails,
  condition: ConditionGrade,
): PriceSuggestion {
  const mediaMultiplier = conditionMultiplier(condition.media_grade);

  if (pressing.discogs_lowest_price && pressing.discogs_lowest_price > 0) {
    const base = pressing.discogs_lowest_price;
    const adjusted = base * mediaMultiplier;
    return {
      quick_sale: Math.round(adjusted * 0.8 * 100) / 100,
      recommended: Math.round(adjusted * 100) / 100,
      high: Math.round(adjusted * 1.3 * 100) / 100,
      currency: "GBP",
      confidence: 0.8,
      basis: `Discogs lowest price £${base.toFixed(2)} × ${condition.media_grade} condition multiplier (${Math.round(mediaMultiplier * 100)}%)`,
    };
  }

  const haveWantRatio =
    pressing.discogs_community_have && pressing.discogs_community_want
      ? pressing.discogs_community_want / pressing.discogs_community_have
      : 0.5;

  const rarityBoost = haveWantRatio > 1 ? 1.2 : haveWantRatio > 0.5 ? 1.0 : 0.8;
  const basePrice = 8 * mediaMultiplier * rarityBoost;
  return {
    quick_sale: Math.round(basePrice * 0.75 * 100) / 100,
    recommended: Math.round(basePrice * 100) / 100,
    high: Math.round(basePrice * 1.4 * 100) / 100,
    currency: "GBP",
    confidence: 0.4,
    basis: "Rules-based estimate (no Discogs price data available)",
  };
}

// ─── Missing photo detection ──────────────────────────────────────────────────

function detectMissingPhotos(
  classified: ClassifiedPhoto[],
  extraction: RecordExtraction,
): string[] {
  const types = new Set(classified.map((c) => c.type));
  const missing: string[] = [];

  if (!types.has("label_side_a") && !types.has("label_side_b")) {
    missing.push("Label photos (Side A & B) — required for identification");
  } else if (!types.has("label_side_a")) {
    missing.push("Label photo — Side A");
  } else if (!types.has("label_side_b")) {
    missing.push("Label photo — Side B");
  }

  if (!types.has("runout_side_a") && !types.has("runout_side_b") && !extraction.matrix_runout_a) {
    missing.push("Matrix / runout groove photos (Side A & B) — for precise pressing identification");
  }

  if (!types.has("front_cover")) {
    missing.push("Front sleeve / cover photo");
  }

  if (!types.has("back_cover")) {
    missing.push("Back sleeve photo (tracklist side)");
  }

  return missing;
}

// ─── Master pipeline function ─────────────────────────────────────────────────

export interface RecordLensAnalysisResult {
  analysis: RecordLensAnalysis;
  usage: { promptTokens: number; completionTokens: number; model: string };
}

interface TokenAccumulator {
  promptTokens: number;
  completionTokens: number;
}

/**
 * Wraps a VisionClientInfo with a token-counting proxy.
 * Returns a new clientInfo whose completions.create accumulates token counts,
 * plus a `getUsage()` accessor — without mutating the original client.
 */
function createTrackedClientInfo(
  clientInfo: VisionClientInfo,
): { trackedInfo: VisionClientInfo; getUsage: () => TokenAccumulator } {
  const acc: TokenAccumulator = { promptTokens: 0, completionTokens: 0 };
  const originalCompletions = clientInfo.client.chat.completions;

  const trackedCompletions: typeof originalCompletions = {
    ...originalCompletions,
    create: (async (...args: Parameters<typeof originalCompletions.create>) => {
      const result = await originalCompletions.create(...args);
      if (result && typeof result === "object" && "usage" in result) {
        const usage = (result as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage;
        acc.promptTokens += usage?.prompt_tokens ?? 0;
        acc.completionTokens += usage?.completion_tokens ?? 0;
      }
      return result;
    }) as typeof originalCompletions.create,
  };

  const trackedClient = Object.create(clientInfo.client) as typeof clientInfo.client;
  Object.defineProperty(trackedClient, "chat", {
    value: { ...clientInfo.client.chat, completions: trackedCompletions },
    writable: false,
    configurable: true,
  });

  return {
    trackedInfo: { ...clientInfo, client: trackedClient },
    getUsage: () => ({ ...acc }),
  };
}

export async function runRecordLensAnalysis(
  photoUrls: string[],
  hint?: string,
  corrections?: AnalysisCorrections,
): Promise<RecordLensAnalysisResult> {
  const baseClientInfo = getVisionClientInfo();
  const { trackedInfo: clientInfo, getUsage } = createTrackedClientInfo(baseClientInfo);

  const stepsCompleted: string[] = [`vision_model: ${clientInfo.model}`];

  if (hint) stepsCompleted.push(`hint_provided: ${hint.slice(0, 50)}`);
  if (corrections && Object.values(corrections).some(Boolean)) {
    stepsCompleted.push("corrections_provided");
  }

  // Step 1: Photo classification
  stepsCompleted.push("step1_image_classification");
  const classified = await classifyPhotos(photoUrls, clientInfo);

  // Step 2: Parallel extraction + condition grading
  stepsCompleted.push("step2_parallel_extraction_and_grading");
  const [extraction, condition] = await Promise.all([
    extractRecordDetails(photoUrls, clientInfo),
    gradeCondition(photoUrls, clientInfo),
  ]);
  logger.info({ extracted: extraction }, "RecordLens extraction");

  if (hint) {
    const hintLower = hint.toLowerCase();
    if (!extraction.artist && hintLower.includes(" - ")) {
      const [a, t] = hint.split(" - ");
      extraction.artist = extraction.artist ?? a?.trim() ?? null;
      extraction.title = extraction.title ?? t?.trim() ?? null;
    }
  }

  // Step 3: Pressing identification (corrections passed in — matrix is priority #1 when provided)
  stepsCompleted.push("step3_pressing_identification");
  const { pressing, alternates: pressAlternates, stepsCompleted: pressSteps } = await identifyPressing(
    extraction,
    clientInfo,
    corrections,
  );
  stepsCompleted.push(...pressSteps);

  // Step 4: Listing copy generation
  stepsCompleted.push("step4_listing_copy_generation");
  const listingCopy = await generateListingCopy(
    pressing,
    condition,
    extraction,
    clientInfo,
  );

  // Step 5: Price suggestion
  stepsCompleted.push("step5_price_suggestion");
  const pricing = suggestPrice(pressing, condition);

  // Missing photos
  const missingPhotos = detectMissingPhotos(classified, extraction);

  // Assemble warnings
  const warnings: string[] = [];
  if (pressing.source === "llm") {
    warnings.push("No Discogs match found — pressing identified by AI analysis only. Verify before listing.");
  }
  if (pressing.source === "extraction_only") {
    warnings.push("Identification based on label reading only — matrix photos would improve accuracy.");
  }
  if (clientInfo.mode === "text_only") {
    warnings.push("Vision not available — analysis based on text input only. Photo analysis requires an xAI or DeepSeek API key.");
  }
  if (!extraction.matrix_runout_a && !extraction.matrix_runout_b) {
    warnings.push("Matrix / runout etchings not visible — pressing generation cannot be confirmed without them.");
  }
  if (pricing.confidence < 0.6) {
    warnings.push("Price estimate is approximate — no Discogs market price data available for this pressing.");
  }

  const artist = pressing.artist ?? extraction.artist ?? null;
  const title = pressing.title ?? extraction.title ?? null;
  const ebayTitle = listingCopy.title.slice(0, 80);

  // Prefer item_specifics from the eBay Listing Creator Agent; fall back to manual build
  const agentSpecifics = listingCopy.item_specifics ?? {};
  const itemSpecifics: Record<string, string> = { ...agentSpecifics };
  // Ensure matrix data is always included (agent may omit it)
  if (extraction.matrix_runout_a) itemSpecifics["Matrix / Run Out (Side A)"] = extraction.matrix_runout_a;
  if (extraction.matrix_runout_b) itemSpecifics["Matrix / Run Out (Side B)"] = extraction.matrix_runout_b;
  // Fill any gaps the agent missed
  if (!itemSpecifics["Artist"] && artist) itemSpecifics["Artist"] = artist;
  if (!itemSpecifics["Record Label"] && pressing.label) itemSpecifics["Record Label"] = pressing.label;
  if (!itemSpecifics["Catalogue Number"] && pressing.catalogue_number) itemSpecifics["Catalogue Number"] = pressing.catalogue_number;

  const analysis: RecordLensAnalysis = {
    mode: "studio",
    lens: "RecordLens",
    listing_description: listingCopy.plain_text_description || condition.grading_notes || listingCopy.description,
    identity: {
      brand: artist,
      model: title,
      confidence: pressing.confidence,
    },
    attributes: {
      artist,
      title,
      label: pressing.label ?? extraction.label_names[0] ?? null,
      catalogue_number: pressing.catalogue_number ?? extraction.catalog_numbers[0] ?? null,
      year: pressing.year ?? extraction.year,
      country: pressing.country ?? extraction.country,
      pressing_format: pressing.format,
      sleeve_grade: condition.sleeve_grade,
      media_grade: condition.media_grade,
      matrix_runout_a: extraction.matrix_runout_a,
      matrix_runout_b: extraction.matrix_runout_b,
      barcodes: extraction.barcodes,
      image_types_detected: classified.map((c) => c.type),
    },
    missing_photos: missingPhotos,
    pricing: {
      quick_sale: pricing.quick_sale,
      recommended: pricing.recommended,
      high: pricing.high,
      currency: "GBP",
      confidence: pricing.confidence,
    },
    marketplace_outputs: {
      ebay: {
        title: ebayTitle,
        condition: `${condition.media_grade} / ${condition.sleeve_grade}`,
        category: "Music > Records",
        item_specifics: itemSpecifics,
        keywords: listingCopy.seo_keywords,
        html_description: listingCopy.html_description,
        seo_title_options: listingCopy.seo_title_options,
      },
      vinted: {
        title: `${artist ?? ""} ${title ?? ""} ${pressing.year ?? ""}`.trim().slice(0, 60),
        category: "Music",
      },
    },
    warnings,
    record_analysis: {
      image_classification: classified,
      extraction,
      condition,
      pressing,
      listing_copy: listingCopy,
      vision_model_used: clientInfo.model,
      pipeline_steps_completed: stepsCompleted,
      needs_matrix_for_clarification: (() => {
        const noMatrix = !extraction.matrix_runout_a && !extraction.matrix_runout_b;
        const topLikelihood = Math.round(pressing.confidence * 100);
        const secondLikelihood = pressAlternates[0]?.likelihood_percent ?? 0;
        // Ambiguous if: multiple versions share same label/catno, OR top result
        // isn't clearly ahead of the runner-up (gap < 20 percentage points)
        const sharedCatno = pressAlternates.some(
          (alt) =>
            alt.label === pressing.label &&
            alt.catalogue_number === pressing.catalogue_number &&
            alt.catalogue_number !== null,
        );
        const smallGap = pressAlternates.length > 0 && (topLikelihood - secondLikelihood) < 20;
        return noMatrix || sharedCatno || smallGap || pressing.confidence < 0.8;
      })(),
      matrix_clarification_sides: ["Side A", "Side B"],
      top_match: {
        artist: pressing.artist,
        title: pressing.title,
        label: pressing.label,
        catalogue_number: pressing.catalogue_number,
        likely_release: [pressing.year, pressing.country, pressing.format].filter(Boolean).join(", ") || "Unknown pressing",
        likelihood_percent: Math.round(pressing.confidence * 100),
        evidence: [
          pressing.source === "discogs"
            ? `Matched Discogs release #${pressing.discogs_release_id}`
            : "Identified by AI analysis",
          extraction.matrix_runout_a ? `Side A matrix: ${extraction.matrix_runout_a}` : null,
          extraction.matrix_runout_b ? `Side B matrix: ${extraction.matrix_runout_b}` : null,
        ].filter(Boolean) as string[],
      },
      alternate_matches: pressAlternates,
    },
  };

  const { promptTokens, completionTokens } = getUsage();
  return {
    analysis,
    usage: { promptTokens, completionTokens, model: clientInfo.model },
  };
}
