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
import { searchDiscogs, getDiscogsRelease } from "./discogs";

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
      model: "grok-2-vision-latest",
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

export interface ListingCopy {
  seo_keywords: string[];
  title: string;
  subtitle: string;
  description: string;
  band_context: string;
  tracklist: string[];
  pressing_highlights: string[];
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
  const systemPrompt = `You are a specialist vinyl record data extractor. Examine ALL photos carefully and extract every piece of identifying information. Return ONLY valid JSON (no markdown):
{
  "catalog_numbers": [ ...all catalogue/catalog numbers seen ],
  "matrix_runout_a": "exact text of Side A matrix/runout etching or null",
  "matrix_runout_b": "exact text of Side B matrix/runout etching or null",
  "label_names": [ ...all record label names visible ],
  "barcodes": [ ...any barcode numbers ],
  "artist": "artist name or null",
  "title": "album/single title or null",
  "year": "year as string or null",
  "country": "pressing country or null",
  "readable_text": "all other readable text from labels and sleeve, verbatim"
}
Be precise. Copy text exactly as it appears. Include all catalogue numbers even if multiple formats shown.`;

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
    max_tokens: 700,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<RecordExtraction>;
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
  const parsed = JSON.parse(raw) as Partial<ConditionGrade>;
  return {
    media_grade: parsed.media_grade ?? "VG+",
    sleeve_grade: parsed.sleeve_grade ?? "VG+",
    defects: parsed.defects ?? [],
    grading_notes: parsed.grading_notes ?? "",
    overall_condition_summary: parsed.overall_condition_summary ?? "",
  };
}

// ─── Step 3: Pressing identification ─────────────────────────────────────────

async function identifyPressingViaDiscogs(
  extraction: RecordExtraction,
): Promise<PressingDetails | null> {
  const searchResults = await searchDiscogs({
    artist: extraction.artist,
    title: extraction.title,
    catno: extraction.catalog_numbers[0] ?? null,
    label: extraction.label_names[0] ?? null,
  }).catch(() => []);

  if (!searchResults.length) return null;

  const topResult = searchResults[0]!;
  const release = await getDiscogsRelease(topResult.id).catch(() => null);
  if (!release) return null;

  const artist = release.artists?.[0]?.name ?? extraction.artist ?? null;
  const title = release.title ?? extraction.title ?? null;
  const label = release.labels?.[0]?.name ?? extraction.label_names[0] ?? null;
  const catno = release.labels?.[0]?.catno ?? extraction.catalog_numbers[0] ?? null;

  const tracklist =
    release.tracklist?.map(
      (t) => `${t.position}. ${t.title}${t.duration ? ` (${t.duration})` : ""}`,
    ) ?? [];

  const format =
    release.formats
      ?.map((f) =>
        [f.name, ...(f.descriptions ?? [])].filter(Boolean).join(", "),
      )
      .join("; ") ?? null;

  return {
    artist,
    title,
    label,
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
    confidence: 0.85,
    source: "discogs",
  };
}

async function identifyPressingViaLLM(
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
): Promise<PressingDetails> {
  const systemPrompt = `You are a world-class vinyl record pressing specialist and discographer. Using the extracted data below, identify the specific pressing.

Return ONLY valid JSON (no markdown):
{
  "artist": string|null,
  "title": string|null,
  "label": string|null,
  "catalogue_number": string|null,
  "year": string|null,
  "country": string|null,
  "format": string|null,
  "pressing_notes": "specific pressing details — original vs reissue, numbering, special editions etc.",
  "confidence": 0-1
}

Use matrix/runout etchings to determine pressing generation (1st press, 2nd press etc.).
Consider label name variants, catalogue number formats, and matrix codes in your identification.`;

  const userText = `Identify this vinyl record pressing:
Artist: ${extraction.artist ?? "unknown"}
Title: ${extraction.title ?? "unknown"}
Label(s): ${extraction.label_names.join(", ") || "unknown"}
Catalogue number(s): ${extraction.catalog_numbers.join(", ") || "unknown"}
Matrix Side A: ${extraction.matrix_runout_a ?? "not visible"}
Matrix Side B: ${extraction.matrix_runout_b ?? "not visible"}
Barcodes: ${extraction.barcodes.join(", ") || "none"}
Year on label: ${extraction.year ?? "not visible"}
Country on label: ${extraction.country ?? "not visible"}
Additional text: ${extraction.readable_text || "none"}`;

  const completion = await clientInfo.client.chat.completions.create({
    model: clientInfo.model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
    max_tokens: 600,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<PressingDetails> & { confidence?: number };
  return {
    artist: parsed.artist ?? extraction.artist,
    title: parsed.title ?? extraction.title,
    label: parsed.label ?? extraction.label_names[0] ?? null,
    catalogue_number: parsed.catalogue_number ?? extraction.catalog_numbers[0] ?? null,
    year: parsed.year ?? extraction.year,
    country: parsed.country ?? extraction.country,
    format: parsed.format ?? null,
    pressing_notes: parsed.pressing_notes ?? null,
    discogs_release_id: null,
    discogs_lowest_price: null,
    discogs_community_have: null,
    discogs_community_want: null,
    discogs_tracklist: [],
    confidence: parsed.confidence ?? 0.5,
    source: "llm",
  };
}

async function identifyPressing(
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
): Promise<{ pressing: PressingDetails; stepsCompleted: string[] }> {
  const steps: string[] = [];

  const discogsResult = await identifyPressingViaDiscogs(extraction);
  steps.push("discogs_search");

  if (discogsResult && discogsResult.confidence >= 0.7) {
    steps.push("discogs_match_found");
    return { pressing: discogsResult, stepsCompleted: steps };
  }

  logger.info("Discogs match not confident enough — falling back to LLM identification");
  steps.push("llm_identification_fallback");
  const llmResult = await identifyPressingViaLLM(extraction, clientInfo);
  if (discogsResult) {
    llmResult.discogs_release_id = discogsResult.discogs_release_id;
    llmResult.discogs_lowest_price = discogsResult.discogs_lowest_price;
    llmResult.discogs_community_have = discogsResult.discogs_community_have;
    llmResult.discogs_community_want = discogsResult.discogs_community_want;
    llmResult.discogs_tracklist = discogsResult.discogs_tracklist;
    llmResult.source = "llm";
  }
  return { pressing: llmResult, stepsCompleted: steps };
}

// ─── Step 4: Listing content generation ───────────────────────────────────────

async function generateListingCopy(
  pressing: PressingDetails,
  condition: ConditionGrade,
  extraction: RecordExtraction,
  clientInfo: VisionClientInfo,
): Promise<ListingCopy> {
  const systemPrompt = `You are an expert vinyl record seller copywriter optimised for eBay UK. Generate compelling, accurate listing content. Return ONLY valid JSON (no markdown):
{
  "seo_keywords": [ ...8-12 keywords for eBay search optimisation ],
  "title": "eBay title max 80 chars — Artist, Title, Label, Year, Format, Grade",
  "subtitle": "eBay subtitle max 55 chars — pressing highlight or condition",
  "description": "3-4 sentences seller description — pressing notes, condition, what makes this special",
  "band_context": "1-2 sentences of historical/cultural context about the artist/record",
  "tracklist": [ ...formatted track list if known ],
  "pressing_highlights": [ ...2-4 bullet points on what makes this pressing notable ]
}`;

  const userText = `Generate eBay listing copy for:
Artist: ${pressing.artist ?? "Unknown Artist"}
Title: ${pressing.title ?? "Unknown Title"}
Label: ${pressing.label ?? "Unknown Label"}
Catalogue No: ${pressing.catalogue_number ?? "unknown"}
Year: ${pressing.year ?? "unknown"}
Country: ${pressing.country ?? "unknown"}
Format: ${pressing.format ?? "LP, Album"}
Pressing notes: ${pressing.pressing_notes ?? "none"}
Media grade: ${condition.media_grade}
Sleeve grade: ${condition.sleeve_grade}
Condition notes: ${condition.grading_notes}
Defects: ${condition.defects.join(", ") || "none noted"}
Matrix Side A: ${extraction.matrix_runout_a ?? "unknown"}
Matrix Side B: ${extraction.matrix_runout_b ?? "unknown"}
Discogs have/want: ${pressing.discogs_community_have ?? "?"} / ${pressing.discogs_community_want ?? "?"}`;

  const completion = await clientInfo.client.chat.completions.create({
    model: clientInfo.model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
    max_tokens: 800,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<ListingCopy>;

  const tracklist =
    parsed.tracklist?.length
      ? parsed.tracklist
      : pressing.discogs_tracklist;

  return {
    seo_keywords: parsed.seo_keywords ?? [],
    title: parsed.title ?? `${pressing.artist ?? ""} - ${pressing.title ?? ""} ${pressing.year ?? ""}`.trim(),
    subtitle: parsed.subtitle ?? `${condition.media_grade} / ${condition.sleeve_grade}`,
    description: parsed.description ?? condition.grading_notes,
    band_context: parsed.band_context ?? "",
    tracklist: tracklist ?? [],
    pressing_highlights: parsed.pressing_highlights ?? [],
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

export async function runRecordLensAnalysis(
  photoUrls: string[],
  hint?: string,
): Promise<RecordLensAnalysis> {
  const clientInfo = getVisionClientInfo();
  const stepsCompleted: string[] = [`vision_model: ${clientInfo.model}`];

  if (hint) stepsCompleted.push(`hint_provided: ${hint.slice(0, 50)}`);

  // Step 1: Photo classification
  stepsCompleted.push("step1_image_classification");
  const classified = await classifyPhotos(photoUrls, clientInfo);

  // Step 2: Parallel extraction + condition grading
  stepsCompleted.push("step2_parallel_extraction_and_grading");
  const [extraction, condition] = await Promise.all([
    extractRecordDetails(photoUrls, clientInfo),
    gradeCondition(photoUrls, clientInfo),
  ]);

  if (hint) {
    const hintLower = hint.toLowerCase();
    if (!extraction.artist && hintLower.includes(" - ")) {
      const [a, t] = hint.split(" - ");
      extraction.artist = extraction.artist ?? a?.trim() ?? null;
      extraction.title = extraction.title ?? t?.trim() ?? null;
    }
  }

  // Step 3: Pressing identification
  stepsCompleted.push("step3_pressing_identification");
  const { pressing, stepsCompleted: pressSteps } = await identifyPressing(
    extraction,
    clientInfo,
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

  const itemSpecifics: Record<string, string> = {};
  if (artist) itemSpecifics["Artist"] = artist;
  if (pressing.label) itemSpecifics["Record Label"] = pressing.label;
  if (pressing.catalogue_number) itemSpecifics["Catalogue Number"] = pressing.catalogue_number;
  if (pressing.year) itemSpecifics["Year"] = pressing.year;
  if (pressing.country) itemSpecifics["Country/Region of Manufacture"] = pressing.country;
  if (pressing.format) itemSpecifics["Format"] = pressing.format;
  if (condition.media_grade) itemSpecifics["Media Grade (Vinyl)"] = condition.media_grade;
  if (condition.sleeve_grade) itemSpecifics["Sleeve Grade"] = condition.sleeve_grade;
  if (extraction.matrix_runout_a) itemSpecifics["Matrix / Run Out (Side A)"] = extraction.matrix_runout_a;
  if (extraction.matrix_runout_b) itemSpecifics["Matrix / Run Out (Side B)"] = extraction.matrix_runout_b;

  return {
    mode: "studio",
    lens: "RecordLens",
    listing_description: condition.grading_notes || listingCopy.description,
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
    },
  };
}
