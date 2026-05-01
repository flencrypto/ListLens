import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { getXaiClient, getOpenAIClient } from "../lib/ai-clients";
import { searchDiscogs, getDiscogsRelease } from "../lib/discogs";
import type { DiscogsRelease } from "../lib/discogs";
import { db, studioItemsTable, guardChecksTable, listingsTable, aiJobLogsTable, usageEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { runRecordLensAnalysis, type AnalysisCorrections } from "../lib/record-lens-analysis";
import {
  runRecordIdentificationAgent,
  type IdentificationInput,
} from "../lib/record-identification-agent";

const router: IRouter = Router();

const STUDIO_PROMPT_VERSION = "studio-v1.1";
const GUARD_PROMPT_VERSION = "guard-v1.1";
const STUDIO_SCHEMA_VERSION = "studio-schema-v1";
const GUARD_SCHEMA_VERSION = "guard-schema-v1";

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
  record_analysis: z.record(z.unknown()).optional(),
});

const TechLensAttributesSchema = z.object({
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  storage_or_spec: z.string().nullable().optional(),
  model_number: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  screen_damage: z.string().nullable().optional(),
  body_damage: z.string().nullable().optional(),
  ports_condition: z.string().nullable().optional(),
  battery_health: z.string().nullable().optional(),
  included_accessories: z.array(z.string()).optional(),
  tested_or_untested: z.enum(["tested", "untested", "unknown"]).nullable().optional(),
  fault_notes: z.string().nullable().optional(),
  activation_lock_status: z.string().nullable().optional(),
  network_lock_status: z.string().nullable().optional(),
}).passthrough();

const BookLensAttributesSchema = z.object({
  title: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  edition: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  dust_jacket_present: z.boolean().nullable().optional(),
  dust_jacket_condition: z.string().nullable().optional(),
  printing_statement: z.string().nullable().optional(),
  spine_condition: z.string().nullable().optional(),
  boards_condition: z.string().nullable().optional(),
  pages_condition: z.string().nullable().optional(),
  foxing: z.string().nullable().optional(),
  annotations: z.string().nullable().optional(),
  signatures: z.string().nullable().optional(),
  completeness: z.string().nullable().optional(),
}).passthrough();

const AntiquesLensAttributesSchema = z.object({
  object_type: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  era_or_style: z.string().nullable().optional(),
  maker_marks: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  chips_or_cracks_or_repairs: z.string().nullable().optional(),
  patina: z.string().nullable().optional(),
  missing_parts: z.string().nullable().optional(),
  provenance: z.string().nullable().optional(),
  estimated_price_range: z.string().nullable().optional(),
}).passthrough();

const AutographLensAttributesSchema = z.object({
  signed_item_type: z.string().nullable().optional(),
  claimed_signer: z.string().nullable().optional(),
  signature_location: z.string().nullable().optional(),
  ink_visibility: z.string().nullable().optional(),
  certificate_or_provenance_present: z.boolean().nullable().optional(),
  coa_issuer: z.string().nullable().optional(),
  event_or_source_notes: z.string().nullable().optional(),
  item_condition: z.string().nullable().optional(),
}).passthrough();

const LENS_ATTRIBUTE_SCHEMAS: Partial<Record<string, z.ZodTypeAny>> = {
  TechLens: TechLensAttributesSchema,
  BookLens: BookLensAttributesSchema,
  AntiquesLens: AntiquesLensAttributesSchema,
  AutographLens: AutographLensAttributesSchema,
};

function validateLensAttributes(lens: string, attributes: unknown): Record<string, unknown> {
  const schema = LENS_ATTRIBUTE_SCHEMAS[lens];
  if (!schema) return attributes as Record<string, unknown>;
  const result = schema.safeParse(attributes);
  if (result.success) return result.data as Record<string, unknown>;
  logger.warn({ lens, issues: result.error.issues }, "Lens attribute validation had issues — using raw attributes");
  return attributes as Record<string, unknown>;
}

const GuardRiskDimensionSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.string(),
});

const GuardOutputSchema = z.object({
  mode: z.literal("guard"),
  lens: z.string(),
  risk: z.object({
    level: z.enum(["low", "medium", "medium_high", "high", "inconclusive"]),
    confidence: z.number().min(0).max(1),
    summary: z.string(),
  }),
  risk_dimensions: z.object({
    price: GuardRiskDimensionSchema,
    photos: GuardRiskDimensionSchema,
    listing_quality: GuardRiskDimensionSchema,
    item_authenticity: GuardRiskDimensionSchema,
    seller_signals: GuardRiskDimensionSchema,
  }),
  red_flags: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      type: z.string(),
      message: z.string(),
    }),
  ),
  green_signals: z.array(
    z.object({
      type: z.string(),
      message: z.string(),
    }),
  ),
  price_analysis: z.object({
    asking_price: z.string().nullable(),
    market_estimate: z.string().nullable(),
    price_verdict: z.enum(["fair", "low_risk_deal", "suspiciously_low", "overpriced", "unknown"]),
    price_note: z.string(),
  }),
  authenticity_signals: z.array(
    z.object({
      marker: z.string(),
      observed: z.string(),
      verdict: z.enum(["pass", "fail", "unclear"]),
    }),
  ),
  missing_photos: z.array(z.string()),
  seller_questions: z.array(z.string()),
  buy_recommendation: z.object({
    verdict: z.enum(["proceed", "proceed_with_caution", "ask_questions_first", "avoid"]),
    reasoning: z.string(),
  }),
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
  TechLens: {
    label: "electronics / tech item",
    category: "Computing, Tablets & Networking",
    attributeHints:
      "brand, model, variant, storage_or_spec, model_number, condition, screen_damage, body_damage, ports_condition, battery_health, included_accessories, tested_or_untested, fault_notes, activation_lock_status, network_lock_status",
  },
  BookLens: {
    label: "book or collectable print",
    category: "Books, Comics & Magazines",
    attributeHints:
      "title, author, publisher, year, edition, isbn, format (hardback/paperback/etc), dust_jacket_present, dust_jacket_condition, printing_statement, spine_condition, boards_condition, pages_condition, foxing, annotations, signatures, completeness",
  },
  AntiquesLens: {
    label: "antique or vintage decorative object",
    category: "Antiques > Decorative Objects",
    attributeHints:
      "object_type, material, era_or_style, maker_marks, dimensions, chips_or_cracks_or_repairs, patina, missing_parts, provenance, estimated_price_range",
  },
  AutographLens: {
    label: "signed item or autograph memorabilia",
    category: "Collectables > Autographs",
    attributeHints:
      "signed_item_type, claimed_signer, signature_location, ink_visibility, certificate_or_provenance_present, coa_issuer, event_or_source_notes, item_condition",
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

const LENS_TRUST_RULES: Partial<Record<string, string>> = {
  AntiquesLens: `CRITICAL TRUST RULES for AntiquesLens: Never make definitive attribution. Always use cautious language: "appears consistent with", "possibly", "style of", "in the manner of". If you cannot confirm a maker mark, say so explicitly. Flag any reproduction risk in warnings.`,
  AutographLens: `CRITICAL TRUST RULES for AutographLens: You do NOT authenticate signatures. Your role is to produce a provenance and evidence risk report only. Never state a signature is genuine. In listing_description, describe the item and the provenance evidence present (COA, event photos, source). If the item is high-value, always include a warning recommending third-party authentication (PSA/DNA, Beckett, JSA, AFTAL). identity.brand should be the claimed signer; identity.model should be the signed item type.`,
};

function buildLensSystemPrompt(lens: string): string {
  const meta = getLensMeta(lens);
  const trustRules = LENS_TRUST_RULES[lens] ?? "";
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
Base prices on current UK resale market values. Be specific — name the exact model, colourway, edition or pressing.${trustRules ? `\n\n${trustRules}` : ""}`;
}

const GPT4O_INPUT_COST_PER_TOKEN = 2.5 / 1_000_000;
const GPT4O_OUTPUT_COST_PER_TOKEN = 10.0 / 1_000_000;
const GROK_VISION_COST_PER_TOKEN = 5.0 / 1_000_000;
const USD_TO_GBP = 0.79;
const PENCE_PER_GBP = 100;

function estimateCostPence(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  let costUsd: number;
  if (model.startsWith("gpt-4o")) {
    costUsd =
      promptTokens * GPT4O_INPUT_COST_PER_TOKEN +
      completionTokens * GPT4O_OUTPUT_COST_PER_TOKEN;
  } else {
    costUsd = (promptTokens + completionTokens) * GROK_VISION_COST_PER_TOKEN;
  }
  return Math.round(costUsd * USD_TO_GBP * PENCE_PER_GBP);
}

interface AnalysisUsage {
  promptTokens: number;
  completionTokens: number;
  model: string;
}

const NEW_LENSES_USING_GROK_VISION = new Set([
  "TechLens",
  "BookLens",
  "AntiquesLens",
  "AutographLens",
]);

async function runStudioAnalysis(
  lens: string,
  photoUrls: string[],
  hint?: string,
): Promise<{ result: z.infer<typeof StudioOutputSchema>; usage: AnalysisUsage }> {
  // RecordLens uses its own dedicated 5-step xAI/grok pipeline
  if (lens === "RecordLens") {
    const { analysis: raw, usage: rlUsage } = await runRecordLensAnalysis(photoUrls, hint);
    const result = StudioOutputSchema.parse(raw);
    return { result, usage: rlUsage };
  }

  const { label: lensLabel } = getLensMeta(lens);
  const systemPrompt = buildLensSystemPrompt(lens);
  const useGrokVision = NEW_LENSES_USING_GROK_VISION.has(lens);
  const client = useGrokVision ? getXaiClient() : getOpenAIClient();

  const userContent: Parameters<
    typeof client.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: hint
        ? `Analyse this ${lensLabel} for resale. Additional context: ${hint}`
        : `Analyse this ${lensLabel} for resale.`,
    },
    ...imageContent(photoUrls),
  ];

  const completion = await client.chat.completions.create({
    model: useGrokVision ? "grok-4-fast-non-reasoning" : "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 1200,
  });

  const model = useGrokVision ? "grok-4-fast-non-reasoning" : "gpt-4o";
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as unknown;
  const result = StudioOutputSchema.parse(parsed);
  result.attributes = validateLensAttributes(lens, result.attributes);
  return { result, usage: { promptTokens, completionTokens, model } };
}

function buildGuardSystemPrompt(lens: string): string {
  const { label: lensLabel } = getLensMeta(lens);

  const lensSpecificAuthMarkers: Record<string, string> = {
    ShoeLens: `Authenticity markers to check for ${lensLabel}s:
- Stitching: uniform, no loose threads, correct stitch count per inch for the brand
- Font consistency: brand logos, text on tongue, insole, heel — correct typeface, spacing, sizing
- Size tag: format, country of manufacture, material composition text, font, spacing
- Sole unit: correct pattern, moulding sharpness, branding location and depth
- Box: correct label format, barcode, colourway code, SKU matching shoe
- Lace tips: correct colour, aglet material and finish
- Insole: correct branding, stitching, cushioning logo placement
- Colourway accuracy: pantone match of uppers, midsole, outsole vs official colourway`,
    LPLens: `Authenticity / condition markers to check for ${lensLabel}s:
- Label: correct font, layout, colour for the pressing era and territory
- Catalogue number: format matches label and matrix, correct country variant
- Matrix/runout etchings: hand-etched vs stamped, pressing plant codes, generation suffix
- Vinyl: colour correct for pressing (black/coloured), weight/thickness consistent with claimed pressing
- Sleeve: correct print quality, spine text, catalogue number matches label
- Price vs discogs market: anomalously cheap first-pressings are almost always bootlegs`,
    RecordLens: `Authenticity / condition markers to check for vinyl records:
- Label authenticity: correct font, layout, and colour for the stated label and era
- Catalogue number consistency: front sleeve, back sleeve, labels, and matrix all agree
- Matrix/runout: visible etching matches claimed pressing generation
- Vinyl condition vs description: visible scratches vs stated grade
- Sleeve condition vs description: seam splits, ring wear, price stickers vs stated grade`,
    ClothingLens: `Authenticity markers to check for clothing:
- Care label: correct format, font, country of manufacture, fibre content
- Brand tag: correct logo, font, thread colour, attachment method
- Stitching: seam quality, thread colour match, stitch density
- Zip: correct brand (YKK etc.), pull tab, slider dimensions
- Buttons/hardware: weight, finish, engraving depth
- Print/embroidery: correct registration, thread count, no pixelation`,
    WatchLens: `Authenticity markers to check for watches:
- Dial text: correct font, spacing, lume plot shape and colour, depth of printing
- Cyclops lens: magnification correct (2.5x for Rolex), alignment
- Case finishing: brushed vs polished surfaces in correct zones
- Crown: correct size, logo engraving depth, threading
- Bracelet: correct link profile, end-link fit, clasp mechanism and markings
- Caseback: correct engravings, serial number format for claimed model and year
- Hands: correct colour, finish, shape, lume application
- Movement (if visible): correct rotor, finishing quality, engravings`,
    CardLens: `Authenticity markers to check for trading cards:
- Print quality: dot pattern, colour registration, no blurring at edges
- Card stock: flex test consistency, correct thickness for the set
- Hologram/foil: correct pattern depth and colour shift for authenticated cards
- Centering: front-to-back and left-to-right ratios
- Edges and corners: cutting precision, no whitening or chips on vintage cards
- Black light test evidence: real cards fluoresce differently from reprints`,
    TechLens: `Risk markers to check for electronics listings:
- Model identification: does stated model, variant and spec match visible markings, IMEI sticker, or serial number?
- Activation lock / network lock: no powered-on proof or missing unlock evidence is HIGH risk for phones
- Missing powered-on photo: absence of a screen-on photo showing the device working is a major red flag
- Condition vs photos: is stated condition grade consistent with visible wear on screen, body, ports and camera module?
- Battery health: no screenshot of battery health stat for high-value laptops/phones is a gap
- Accessories: cables, chargers, boxes and accessories must match the claimed set
- Stolen/blacklisted risk: no IMEI check evidence on phone listings is a gap; flag as a question
- Spec mismatch: storage, RAM, or colour that doesn't match the claimed model variant`,
    BookLens: `Risk markers to check for book and collectable print listings:
- First edition claim: must be evidenced by the copyright page printing statement (e.g. "First published…", "First edition"); absence is HIGH risk for premium pricing
- Printing statement not shown: copyright page photo is essential for first edition / early printing claims — flag if missing
- ISBN: does stated ISBN match the claimed edition and year?
- Dust jacket: presence/condition greatly affects value — missing or undisclosed jacket damage is a red flag
- Signature / provenance claim: if signature is the main value driver, route to AutographLens logic — treat as uncertain without COA
- Condition vs description: spine cracks, foxing, tanning, annotations must match stated condition
- Completeness: maps, plates, inserts missing in illustrated editions is a material defect`,
    AntiquesLens: `Risk markers to check for antiques and vintage decorative object listings. Use cautious language: "appears consistent with", "possibly", "style of" — never make definitive attribution:
- Maker marks / hallmarks: are marks photographed and legible? Absence of a close-up mark photo is a gap
- Era consistency: do form, glaze, material, construction technique and patina appear consistent with the claimed era?
- Reproduction / later copy risk: "style of" or "after" pieces are not originals — flag obvious reproduction indicators
- Repairs and restoration: chips, cracks, filled repairs, re-gilding must be disclosed; UV light evidence of restoration is a gap without photos
- Provenance: estate sale / auction house provenance adds confidence; private seller with no paper trail is a gap
- Condition vs photos: chips, cracks, crazing or missing parts must match stated condition
- Price vs market: anomalously cheap claimed rare items (e.g. Meissen, Clarice Cliff) are almost always reproductions`,
    AutographLens: `Risk markers for signed item and autograph provenance checks. IMPORTANT: never authenticate signatures — only produce an evidence and provenance risk report. Always recommend third-party authentication (e.g. PSA, Beckett, JSA) for high-value items:
- COA issuer credibility: generic or unknown COA issuers (self-issued, unknown companies) are HIGH risk; recognised issuers (PSA/DNA, Beckett, JSA, AFTAL) add confidence
- COA evidence: is the COA shown in full with matching item description, date and hologram?
- Provenance chain: event photos, purchase receipts, or verifiable source chain add confidence; absence is a gap
- Signature consistency: does the visible signature appear consistent with known reference examples for the claimed signer? Note this is NOT authentication
- Ink visibility and pen type: faded, smudged or inconsistent ink is a risk flag
- Item condition: framing, mounting or storage affecting long-term preservation
- Price vs market: anomalously cheap "signed" items from high-value signers are very high risk
- Photo evidence: in-person signing photo or video is the strongest provenance signal`,
  };

  const authMarkers = lensSpecificAuthMarkers[lens] ?? `Check key authenticity markers relevant to ${lensLabel}s including branding consistency, materials, construction quality, and condition vs description accuracy.`;

  return `You are a senior fraud and risk analyst specialising in second-hand ${lensLabel} listings. You have deep expertise in spotting fakes, scams, and misrepresented items.

${authMarkers}

Analyse the provided listing URL and/or screenshots comprehensively and return ONLY valid JSON (no markdown, no code fences) conforming exactly to this schema:
{
  "mode": "guard",
  "lens": "${lens}",
  "risk": {
    "level": "low"|"medium"|"medium_high"|"high"|"inconclusive",
    "confidence": 0-1,
    "summary": "2-3 sentence overall verdict explaining the risk level and key reasoning"
  },
  "risk_dimensions": {
    "price":            { "score": 0-10 (10=safest), "verdict": "one-line verdict" },
    "photos":           { "score": 0-10, "verdict": "one-line verdict" },
    "listing_quality":  { "score": 0-10, "verdict": "one-line verdict" },
    "item_authenticity":{ "score": 0-10, "verdict": "one-line verdict" },
    "seller_signals":   { "score": 0-10, "verdict": "one-line verdict" }
  },
  "red_flags": [
    { "severity": "low"|"medium"|"high", "type": "SHORT_CATEGORY_NAME", "message": "Specific, actionable observation" }
  ],
  "green_signals": [
    { "type": "SHORT_CATEGORY_NAME", "message": "Specific positive signal that builds confidence" }
  ],
  "price_analysis": {
    "asking_price": "detected price as string e.g. £85 or null if not visible",
    "market_estimate": "expected price range for this item in stated condition e.g. £70–£110 or null",
    "price_verdict": "fair"|"low_risk_deal"|"suspiciously_low"|"overpriced"|"unknown",
    "price_note": "1-2 sentences explaining the price assessment"
  },
  "authenticity_signals": [
    { "marker": "specific feature examined", "observed": "what you saw or could not see", "verdict": "pass"|"fail"|"unclear" }
  ],
  "missing_photos": [ "specific photo that would help verify authenticity" ],
  "seller_questions": [ "specific question to ask the seller before buying" ],
  "buy_recommendation": {
    "verdict": "proceed"|"proceed_with_caution"|"ask_questions_first"|"avoid",
    "reasoning": "2-3 sentences — clear, actionable buying advice"
  },
  "disclaimer": "AI-assisted risk screen, not formal authentication."
}

Rules:
- red_flags[*].message: cite specific observed evidence — not generic labels. Bad: "Missing photos." Good: "Only 2 photos visible: one main shot and one sole — no size label, no heel close-up, no tongue/insole shot."
- risk_dimensions[*].verdict: write one complete sentence explaining WHY the score is what it is. Bad: "Low risk." Good: "Price sits 5% above the typical eBay sold range for this colourway, suggesting no pressure-sale motivation."
- buy_recommendation.reasoning: end with 1–3 numbered action steps the buyer can take right now (e.g. "1. Request a close-up of the size tag. 2. Check seller feedback for previous trainer sales. 3. Use eBay buyer protection and pay via PayPal goods & services.")
- red_flags: include ALL genuine concerns, no limit — be thorough
- green_signals: include ALL genuine positives — balanced analysis builds trust
- authenticity_signals: examine every visible authenticity marker, minimum 4 entries; each "observed" field must describe exactly what you saw or could not see
- seller_questions: 4-6 specific, targeted questions (not generic)
- price_analysis: always attempt to estimate market value from your knowledge
- Be specific — name exact models, colourways, pressing details. Vague statements are useless.
- If screenshots show stock photos instead of actual item photos, flag this as HIGH severity
- If price is more than 30% below market rate, flag as HIGH severity
- score 8-10 = low risk, 5-7 = moderate risk, 2-4 = high risk, 0-1 = very high risk`;
}

async function runGuardAnalysis(
  lens: string,
  url?: string,
  screenshotUrls?: string[],
): Promise<{ result: z.infer<typeof GuardOutputSchema>; usage: AnalysisUsage }> {
  const useGrokVision = NEW_LENSES_USING_GROK_VISION.has(lens);
  const client = useGrokVision ? getXaiClient() : getOpenAIClient();

  const systemPrompt = buildGuardSystemPrompt(lens);

  const userParts: Parameters<
    typeof client.chat.completions.create
  >[0]["messages"][0]["content"] = [
    {
      type: "text",
      text: url
        ? `Perform a deep fraud and risk analysis on this listing. Listing URL: ${url}`
        : `Perform a deep fraud and risk analysis on this listing.`,
    },
    ...imageContent(screenshotUrls ?? []),
  ];

  const completion = await client.chat.completions.create({
    model: useGrokVision ? "grok-4-fast-non-reasoning" : "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userParts },
    ],
    max_tokens: 2000,
  });

  const model = useGrokVision ? "grok-4-fast-non-reasoning" : "gpt-4o";
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as unknown;
  const result = GuardOutputSchema.parse(parsed);
  return { result, usage: { promptTokens, completionTokens, model } };
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

  const systemPrompt = `You are an expert in vinyl record identification. Examine ALL label and matrix photos with extreme care. Return ONLY valid JSON (no markdown):
{
  "artist": "artist name exactly as printed or null",
  "title": "album or single title exactly as printed or null",
  "label": "record label name exactly as printed, e.g. 'Polydor', 'Harvest', 'XL Recordings', 'AWL' — or null",
  "catalogue_number": "the catalogue/catalog number printed on the label — typically near the centre hole or on the label ring, e.g. 'POLD 5046', '2383 449', 'AWL 1002', 'XLLP780' — copy EXACTLY or null",
  "matrix": "exact text hand-etched or stamped in the dead wax (runout groove) — copy character-for-character, both sides if visible — or null",
  "additional_details": "year, country of manufacture, RPM speed, pressing plant codes, copyright text, track listing, producer credits — anything else readable"
}

CRITICAL: The catalogue number is the most important field for identifying a pressing. It is usually printed in a distinct font on the label face, often near the centre hole or along the label edge. Do NOT confuse it with the matrix/runout etching. Read it character-by-character and copy exactly.`;

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
    model: "grok-4-fast-non-reasoning",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 800,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const result = JSON.parse(raw) as XaiRecordExtraction;
  logger.info({ extracted: result }, "xAI record extraction");
  return result;
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
  matrixText?: { sideA?: string; sideB?: string; sideCD?: string },
): Promise<Record<string, unknown>> {
  const hasMatrixPhoto = matrixUrls.length > 0;
  const hasMatrixText = !!(matrixText?.sideA || matrixText?.sideB || matrixText?.sideCD);
  const hasMatrix = hasMatrixPhoto || hasMatrixText;

  // xAI extraction — hard-fail so the route returns 500 on model errors
  // (extraction is logged inside extractRecordDetailsFromImage)
  const extracted = await extractRecordDetailsFromImage(labelUrls, matrixUrls);

  // Inject text matrix overrides from the clarification form
  if (matrixText?.sideA && !extracted.matrix) {
    const parts = [matrixText.sideA, matrixText.sideB, matrixText.sideCD]
      .filter(Boolean)
      .join(" / ");
    extracted.matrix = parts;
  }

  // Discogs search — progressively relax constraints so a wrong label/catno
  // from OCR doesn't silently block all results.
  async function discogsWithFallback(): Promise<DiscogsSearchResult[]> {
    const attempts = [
      { artist: extracted.artist, title: extracted.title, catno: extracted.catalogue_number, label: extracted.label },
      { artist: extracted.artist, title: extracted.title, catno: extracted.catalogue_number, label: null },
      { artist: extracted.artist, title: extracted.title, catno: null, label: null },
    ];
    for (const q of attempts) {
      const results = await searchDiscogs(q).catch(() => []);
      if (results.length) return results;
    }
    return [];
  }
  const searchResults = await discogsWithFallback();

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

  const matrixEvidence = [
    matrixText?.sideA ? `Side A matrix: ${matrixText.sideA}` : null,
    matrixText?.sideB ? `Side B matrix: ${matrixText.sideB}` : null,
    matrixText?.sideCD ? `Side C/D matrix: ${matrixText.sideCD}` : null,
    !matrixText && extracted.matrix ? `Matrix: ${extracted.matrix}` : null,
  ].filter(Boolean) as string[];

  // ─── Record Identification Intelligence Agent ────────────────────────────────
  // Passes extracted OCR data + all Discogs candidates to the agent for
  // evidence-hierarchy scoring, conflict detection, and % likelihood outputs.
  const xai = getXaiClient();
  const identificationInput: IdentificationInput = {
    artist: extracted.artist ?? null,
    title: extracted.title ?? null,
    label: extracted.label ?? null,
    catalogue_number: extracted.catalogue_number ?? null,
    matrix_side_a: extracted.matrix ?? matrixText?.sideA ?? null,
    matrix_side_b: matrixText?.sideB ?? null,
    barcodes: [],
    year: null,
    country: null,
    readable_text: extracted.additional_details ?? "",
    discogs_candidates: [
      topRelease
        ? {
            release_id: topRelease.id,
            artist: topArtist,
            title: topTitle,
            label: topLabel,
            catno: topCatno,
            year: topRelease.year ? String(topRelease.year) : null,
            country: topRelease.country ?? null,
            format: topRelease.formats?.[0]?.name ?? null,
          }
        : null,
      ...altSearchResults.map((sr) => ({
        release_id: sr.id,
        artist: sr.title?.split(" - ")[0] ?? null,
        title: sr.title?.split(" - ")[1] ?? null,
        label: (sr.label ?? [null])[0] ?? null,
        catno: sr.catno ?? null,
        year: sr.year ?? null,
        country: sr.country ?? null,
        format: (sr.format ?? [])[0] ?? null,
      })),
    ].filter(Boolean) as IdentificationInput["discogs_candidates"],
  };

  const agentResult = await runRecordIdentificationAgent(
    identificationInput,
    xai,
    "grok-4-fast-non-reasoning",
  ).catch((err) => {
    logger.warn({ err }, "RecordIdentificationAgent failed — using Discogs-only result");
    return null;
  });

  const agentTop = agentResult?.candidates[0];

  // Use agent's likelihood if available, else fall back to heuristic
  const topLikelihood = agentTop?.likelihood_percent
    ?? (topSearchResult ? (hasMatrixText ? 88 : 75) : (hasMatrixText ? 55 : 40));

  // Build top match — agent's top candidate wins; Discogs fills market data
  let topMatch: Record<string, unknown> = {
    artist: agentTop?.artist ?? topArtist,
    title: agentTop?.title ?? topTitle,
    label: agentTop?.label ?? topLabel,
    catalogue_number: agentTop?.catalogue_number ?? topCatno,
    pressing_notes: agentTop?.pressing_notes ?? null,
    bootleg_risk: agentTop?.bootleg_risk ?? "none",
    likely_release:
      [
        topRelease?.year ? `${topRelease.year}` : null,
        topRelease?.country ?? null,
        topRelease?.formats?.[0]?.name ?? null,
        extracted.matrix ? `Matrix: ${extracted.matrix}` : null,
      ]
        .filter(Boolean)
        .join(", ") || "Unknown pressing",
    likelihood_percent: topLikelihood,
    evidence: agentTop?.evidence?.length
      ? agentTop.evidence
      : [
          extracted.artist ? `Artist "${extracted.artist}" read from label` : null,
          extracted.catalogue_number ? `Catalogue number "${extracted.catalogue_number}" read from label` : null,
          topRelease ? `Matched Discogs release #${topRelease.id}` : null,
          ...matrixEvidence,
        ].filter(Boolean) as string[],
  };

  if (topRelease && topSearchResult) {
    topMatch = enrichMatchWithDiscogs(topMatch, topRelease, topSearchResult);
  }

  // Build alternate matches from agent candidates (if available) or Discogs
  const alternateMatches: Record<string, unknown>[] = agentResult?.candidates.slice(1).length
    ? agentResult.candidates.slice(1).map((c) => ({
        artist: c.artist,
        title: c.title,
        label: c.label,
        catalogue_number: c.catalogue_number,
        pressing_notes: c.pressing_notes,
        bootleg_risk: c.bootleg_risk,
        likely_release: [c.year, c.country, c.format].filter(Boolean).join(", ") || (c.pressing_notes ?? "Alternate pressing"),
        likelihood_percent: c.likelihood_percent,
        evidence: c.evidence,
      }))
    : await Promise.all(
        altSearchResults.map(async (sr, idx) => {
          const release = await getDiscogsRelease(sr.id).catch(() => null);
          const artist = release?.artists?.[0]?.name ?? sr.title?.split(" - ")[0] ?? null;
          const title = release?.title ?? sr.title?.split(" - ")[1] ?? null;
          let match: Record<string, unknown> = {
            artist,
            title,
            label: release?.labels?.[0]?.name ?? (sr.label ?? [null])[0] ?? null,
            catalogue_number: release?.labels?.[0]?.catno ?? sr.catno ?? null,
            likely_release: [sr.year, sr.country, (sr.format ?? [])[0]].filter(Boolean).join(", ") || "Alternate pressing",
            likelihood_percent: Math.max(10, 40 - idx * 15),
            evidence: [`Alternate Discogs match #${sr.id}`],
          };
          if (release) match = enrichMatchWithDiscogs(match, release, sr);
          return match;
        }),
      );

  // Conflicts and missing evidence come from the agent; fall back to static logic
  const agentConflicts = agentResult?.conflicts ?? [];
  const noMatrix = !hasMatrix && !extracted.matrix;

  const secondLikelihood = (alternateMatches[0]?.likelihood_percent as number) ?? 0;
  const sharedCatno = alternateMatches.some(
    (alt) => alt.label === topLabel && alt.catalogue_number === topCatno && topCatno !== null,
  );
  const smallGap = alternateMatches.length > 0 && (topLikelihood - secondLikelihood) < 20;
  const needsMatrix = noMatrix || sharedCatno || smallGap || topLikelihood < 80;

  // Agent provides specific photo prompts; fall back to generic matrix questions
  const missingEvidence = agentResult?.missing_evidence?.length
    ? agentResult.missing_evidence
    : needsMatrix
      ? [
          "Photograph the hand-etched text in the dead wax (runout) on Side A — the smooth ring between the last track and the centre label",
          "Photograph the dead wax on Side B as well",
        ]
      : [];

  const pressedConfidence = hasMatrix ? Math.min(95, topLikelihood + 5) : topLikelihood;

  const warnings: string[] = [];
  if (!topSearchResult) warnings.push("Could not find a Discogs match — result is based on label reading only.");
  if (agentTop?.bootleg_risk === "high") warnings.push("Bootleg risk detected — label or matrix inconsistencies noted.");
  if (agentTop?.bootleg_risk === "medium") warnings.push("Pressing origin uncertain — verify authenticity before buying.");
  if (agentConflicts.length) warnings.push(...agentConflicts);

  return {
    mode: "recordlens.identify",
    lens: "RecordLens",
    input_type: hasMatrix ? "label_and_matrix" : "single_label_photo",
    top_match: {
      ...topMatch,
      likelihood_percent: pressedConfidence,
    },
    alternate_matches: alternateMatches,
    needs_matrix_for_clarification: needsMatrix,
    missing_evidence: missingEvidence,
    safe_summary: agentResult?.safe_summary ?? null,
    identification_complete: agentResult?.identification_complete ?? false,
    warnings,
    disclaimer:
      "AI-assisted release identification — confirm pressing details before listing or buying.",
  };
}

router.get("/items", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "You must be logged in to view listings." });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.userId, userId))
      .orderBy(desc(listingsTable.createdAt));
    res.json({ listings: rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch listings");
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

router.post("/items", async (req, res) => {
  const b = body(req);
  const id = newId("item");
  const lens = (b["lens"] as string) ?? "ShoeLens";
  const marketplace = b["marketplace"] as string | undefined;
  const photoUrls = (b["photoUrls"] as string[]) ?? [];
  const userId = req.user?.id ?? null;

  itemMeta.set(id, { lens, marketplace, photoUrls });

  try {
    await db.insert(listingsTable).values({
      id,
      userId,
      lens,
      marketplace,
      photoUrls,
      status: "draft",
    });
  } catch (err) {
    logger.warn({ err, id }, "Could not persist listing to DB (non-fatal)");
  }

  if (userId) {
    db.insert(usageEventsTable)
      .values({
        id: newId("evt"),
        userId,
        eventType: "item_created",
        metadata: { itemId: id, lens, marketplace: marketplace ?? null },
      })
      .catch((err) => logger.warn({ err }, "usage_events item_created insert failed (non-fatal)"));
  }

  res.json({ id, lens, marketplace, status: "draft" });
});

router.post("/items/:id/analyse", async (req, res) => {
  const { id } = req.params;
  const b = body(req);

  const ownership = await fetchOwnedListing(id, req.user?.id);
  if (ownership.dbError) {
    res.status(503).json({ error: "Service temporarily unavailable." });
    return;
  }
  if (ownership.denied) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (ownership.notFound && !itemMeta.has(id)) {
    res.status(404).json({ error: "Listing not found." });
    return;
  }

  const meta = itemMeta.get(id) ?? {};
  const lens = (b["lens"] as string) ?? meta.lens ?? "ShoeLens";
  const hint = (b["hint"] as string) ?? meta.hint;
  const photoUrls = (b["photoUrls"] as string[]) ?? meta.photoUrls ?? [];
  const userId = req.user?.id;

  try {
    const { result: analysis, usage } = await runStudioAnalysis(lens, photoUrls, hint);
    studioStore.set(id, analysis);

    const ebayTitle = String((analysis.marketplace_outputs?.ebay as Record<string, unknown>)?.["title"] ?? "");
    const identity = analysis.identity as { brand?: string | null; model?: string | null } | undefined;
    const title = ebayTitle || [identity?.brand, identity?.model].filter(Boolean).join(" ") || "Untitled listing";
    const pricing = analysis.pricing as { recommended?: number; currency?: string } | undefined;
    const price = pricing?.recommended != null ? String(pricing.recommended) : null;
    const description = (analysis as Record<string, unknown>)["listing_description"] as string | null ?? null;

    if (userId) {
      await db.insert(studioItemsTable)
        .values({ id, userId, lens, title, status: "analysed" })
        .onConflictDoUpdate({ target: studioItemsTable.id, set: { title, status: "analysed" } })
        .catch((err) => logger.warn({ err }, "studio_items insert failed (non-fatal)"));
    }

    try {
      await db
        .update(listingsTable)
        .set({
          analysis,
          title,
          price,
          description,
          hint: hint ?? null,
          photoUrls,
          status: "analysed",
        })
        .where(eq(listingsTable.id, id));
    } catch (dbErr) {
      logger.warn({ dbErr, id }, "Could not persist analysis to DB (non-fatal)");
    }

    const confidencePct = Math.round((analysis.identity?.confidence ?? 0) * 100);
    try {
      await db.insert(aiJobLogsTable).values({
        id: newId("aijob"),
        userId: userId ?? null,
        jobType: "studio",
        itemId: id,
        checkId: null,
        lens,
        model: usage.model,
        promptVersion: STUDIO_PROMPT_VERSION,
        schemaVersion: STUDIO_SCHEMA_VERSION,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        estimatedCostPence: estimateCostPence(usage.model, usage.promptTokens, usage.completionTokens),
        confidence: confidencePct,
        warnings: analysis.warnings ?? [],
        fullOutput: analysis as unknown as Record<string, unknown>,
      });
    } catch (logErr) {
      logger.warn({ logErr }, "ai_job_logs insert failed (non-fatal)");
    }

    if (userId) {
      try {
        await db.insert(usageEventsTable).values({
          id: newId("evt"),
          userId,
          eventType: "analysis_run",
          metadata: { jobType: "studio", lens, itemId: id, model: usage.model },
        });
      } catch (evtErr) {
        logger.warn({ evtErr }, "usage_events insert failed (non-fatal)");
      }
    }

    res.json({ analysis });
  } catch (err) {
    logger.error({ err, id }, "Studio analysis failed");
    res
      .status(500)
      .json({ error: "Studio analysis failed. Please try again." });
  }
});

// ─── Re-analyse with user corrections ────────────────────────────────────────
//
// Accepts user-supplied corrections (matrix, country, year, catno, etc.) and
// re-runs the full RecordLens pipeline with those corrections applied.
// Matrix corrections become the #1 priority Discogs search strategy.

router.post("/items/:id/reanalyse", async (req, res) => {
  const { id } = req.params;
  const b = body(req);

  const ownership = await fetchOwnedListing(id, req.user?.id);
  if (ownership.dbError) {
    res.status(503).json({ error: "Service temporarily unavailable." });
    return;
  }
  if (ownership.denied) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const corrections = (b["corrections"] as AnalysisCorrections | undefined) ?? {};
  const userId = req.user?.id;

  // Load photoUrls — try in-memory meta first, then DB
  const meta = itemMeta.get(id) ?? {};
  let photoUrls: string[] = meta.photoUrls ?? [];
  const hint = meta.hint;
  const lens = meta.lens ?? "RecordLens";

  if (!photoUrls.length && ownership.row?.photoUrls?.length) {
    photoUrls = ownership.row.photoUrls as string[];
  }

  if (!photoUrls.length) {
    res.status(400).json({ error: "No photos found for this item. Please re-upload your photos." });
    return;
  }

  if (lens !== "RecordLens") {
    res.status(400).json({ error: "Re-analysis with corrections is only supported for RecordLens." });
    return;
  }

  try {
    logger.info({ id, corrections }, "Starting re-analysis with user corrections");
    const { analysis: raw, usage } = await runRecordLensAnalysis(photoUrls, hint, corrections);
    const analysis = StudioOutputSchema.parse(raw);

    // Persist updated analysis
    const ebayTitle = String((analysis.marketplace_outputs?.ebay as Record<string, unknown>)?.["title"] ?? "");
    const identity = analysis.identity as { brand?: string | null; model?: string | null } | undefined;
    const title = ebayTitle || [identity?.brand, identity?.model].filter(Boolean).join(" ") || "Untitled listing";
    const price = (analysis.pricing as { recommended?: number } | undefined)?.recommended != null
      ? String((analysis.pricing as { recommended: number }).recommended)
      : null;
    const description = (analysis as Record<string, unknown>)["listing_description"] as string | null ?? null;

    try {
      await db
        .update(listingsTable)
        .set({ analysis, title, price, description, status: "analysed" })
        .where(eq(listingsTable.id, id));
    } catch (dbErr) {
      logger.warn({ dbErr, id }, "Could not persist re-analysis to DB (non-fatal)");
    }

    try {
      await db.insert(aiJobLogsTable).values({
        id: newId("aijob"),
        userId: userId ?? null,
        jobType: "studio",
        itemId: id,
        checkId: null,
        lens,
        model: usage.model,
        promptVersion: STUDIO_PROMPT_VERSION,
        schemaVersion: STUDIO_SCHEMA_VERSION,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        estimatedCostPence: estimateCostPence(usage.model, usage.promptTokens, usage.completionTokens),
        confidence: Math.round((analysis.identity?.confidence ?? 0) * 100),
        warnings: analysis.warnings ?? [],
        fullOutput: analysis as unknown as Record<string, unknown>,
      });
    } catch (logErr) {
      logger.warn({ logErr }, "ai_job_logs re-analyse insert failed (non-fatal)");
    }

    res.json({ analysis });
  } catch (err) {
    logger.error({ err, id }, "Re-analysis failed");
    res.status(500).json({ error: "Re-analysis failed. Please try again." });
  }
});

type OwnedListingResult =
  | { row: typeof listingsTable.$inferSelect; denied: false; dbError: false; notFound: false }
  | { row: null; denied: false; dbError: false; notFound: true }
  | { row: null; denied: true; dbError: false; notFound: false }
  | { row: null; denied: false; dbError: true; notFound: false };

async function fetchOwnedListing(
  id: string,
  currentUserId: string | undefined,
): Promise<OwnedListingResult> {
  try {
    const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!row) {
      return { row: null, denied: false, dbError: false, notFound: true };
    }
    if (row.userId !== null && row.userId !== currentUserId) {
      return { row: null, denied: true, dbError: false, notFound: false };
    }
    return { row, denied: false, dbError: false, notFound: false };
  } catch (err) {
    logger.warn({ err, id }, "DB error during ownership check — denying access");
    return { row: null, denied: false, dbError: true, notFound: false };
  }
}

router.get("/items/:id/analysis", async (req, res) => {
  const { id } = req.params;
  const result = await fetchOwnedListing(id, req.user?.id);
  if (result.dbError) {
    res.status(503).json({ error: "Service temporarily unavailable." });
    return;
  }
  if (result.denied) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const cached = studioStore.get(id);
  if (cached) {
    res.json({ analysis: cached });
    return;
  }
  if (result.row?.analysis) {
    studioStore.set(id, result.row.analysis);
    if (!itemMeta.has(id)) {
      itemMeta.set(id, {
        lens: result.row.lens,
        marketplace: result.row.marketplace ?? undefined,
        photoUrls: result.row.photoUrls ?? [],
      });
    }
    res.json({ analysis: result.row.analysis });
    return;
  }
  res.status(404).json({ error: "Not found" });
});

router.post("/items/:id/export/vinted", async (req, res) => {
  const { id } = req.params;
  const result = await fetchOwnedListing(id, req.user?.id);
  if (result.dbError) {
    res.status(503).json({ error: "Service temporarily unavailable." });
    return;
  }
  if (result.denied) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const analysis = studioStore.get(id) ?? result.row?.analysis;
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
  const userId = req.user?.id;
  if (userId) {
    db.insert(usageEventsTable)
      .values({
        id: newId("evt"),
        userId,
        eventType: "listing_exported",
        metadata: { itemId: id, platform: "vinted" },
      })
      .catch((err) => logger.warn({ err }, "usage_events listing_exported insert failed (non-fatal)"));
  }
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

  const ownershipResult = await fetchOwnedListing(id, userId);
  if (ownershipResult.dbError) {
    res.status(503).json({ error: "Service temporarily unavailable." });
    return;
  }
  if (ownershipResult.denied) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const { addEbayItem, refreshEbayToken, getEbaySettings } = await import("../lib/ebay");

    const accessToken = await refreshEbayToken(userId);
    if (!accessToken) {
      res.status(403).json({
        error: "eBay account not connected. Connect your eBay account in the billing settings before publishing.",
      });
      return;
    }

    const dbRow = ownershipResult.row;
    let stored = studioStore.get(id) ?? dbRow?.analysis ?? {};
    let meta = itemMeta.get(id) ?? (dbRow
      ? { lens: dbRow.lens, marketplace: dbRow.marketplace ?? undefined, photoUrls: dbRow.photoUrls ?? [] }
      : {});

    const ebayOutput = (stored["marketplace_outputs"] as Record<string, unknown> | undefined)?.["ebay"] as Record<string, unknown> | undefined ?? {};
    const resolvedDescription = description || String(stored["listing_description"] ?? ebayOutput["description"] ?? "");
    const resolvedCondition = String(ebayOutput["condition"] ?? stored["condition"] ?? "Used");

    const photoUrls = ((meta.photoUrls ?? []) as unknown[]).filter(
      (u): u is string => typeof u === "string" && u.startsWith("http"),
    );

    const identity = stored["identity"] as
      | { brand?: string | null; model?: string | null }
      | undefined;
    const userSettings = await getEbaySettings(userId);

    const result = await addEbayItem(accessToken, {
      title,
      description: resolvedDescription,
      price,
      lens,
      condition: resolvedCondition,
      attributes: (stored["attributes"] as Record<string, unknown> | undefined) ?? {},
      identity,
      photoUrls,
      settings: {
        shippingCost: userSettings.shippingCost,
        returnsAccepted: userSettings.returnsAccepted,
        returnPeriod: userSettings.returnPeriod,
        paymentMethod: userSettings.paymentMethod,
      },
    });

    if (!result) {
      res.status(502).json({ error: "eBay rejected the listing. Check your item details and try again." });
      return;
    }

    db.insert(usageEventsTable)
      .values({
        id: newId("evt"),
        userId,
        eventType: "listing_exported",
        metadata: { itemId: id, platform: "ebay", listingId: result.itemId },
      })
      .catch((err) => logger.warn({ err }, "usage_events listing_exported insert failed (non-fatal)"));

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

/** List the authenticated user's guard checks (DB-backed, post-analysis only). */
router.get("/guard/checks", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "You must be logged in to view Guard checks." });
    return;
  }
  try {
    const checks = await db
      .select()
      .from(guardChecksTable)
      .where(eq(guardChecksTable.userId, userId))
      .orderBy(desc(guardChecksTable.createdAt))
      .limit(50);
    res.json({ checks });
  } catch (err) {
    logger.error({ err }, "guard_checks list failed");
    res.status(500).json({ error: "Failed to load Guard checks" });
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
  const lens = meta.lens ?? "ShoeLens";
  try {
    const { result: report, usage } = await runGuardAnalysis(
      lens,
      meta.url,
      meta.screenshotUrls,
    );
    guardStore.set(id, report);

    if (userId) {
      await db.insert(guardChecksTable)
        .values({
          id,
          userId,
          lens,
          url: meta.url ?? null,
          riskLevel: report.risk.level,
          status: "checked",
        })
        .onConflictDoUpdate({ target: guardChecksTable.id, set: { riskLevel: report.risk.level } })
        .catch((err) => logger.warn({ err }, "guard_checks insert failed (non-fatal)"));
    }

    const confidencePct = Math.round((report.risk?.confidence ?? 0) * 100);
    try {
      await db.insert(aiJobLogsTable).values({
        id: newId("aijob"),
        userId: userId ?? null,
        jobType: "guard",
        itemId: null,
        checkId: id,
        lens,
        model: usage.model,
        promptVersion: GUARD_PROMPT_VERSION,
        schemaVersion: GUARD_SCHEMA_VERSION,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        estimatedCostPence: estimateCostPence(usage.model, usage.promptTokens, usage.completionTokens),
        confidence: confidencePct,
        warnings: report.red_flags.map((f) => f.message),
        fullOutput: report as unknown as Record<string, unknown>,
      });
    } catch (logErr) {
      logger.warn({ logErr }, "ai_job_logs insert failed (non-fatal)");
    }

    if (userId) {
      try {
        await db.insert(usageEventsTable).values({
          id: newId("evt"),
          userId,
          eventType: "guard_check_run",
          metadata: { lens, checkId: id, riskLevel: report.risk.level, model: usage.model },
        });
      } catch (evtErr) {
        logger.warn({ evtErr }, "usage_events insert failed (non-fatal)");
      }
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
  const labelUrls = (b["labelPhotoUrls"] as string[] | undefined) ?? (b["labelUrls"] as string[] | undefined) ?? [];
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
  const labelUrls = (b["labelPhotoUrls"] as string[] | undefined) ?? (b["labelUrls"] as string[] | undefined) ?? [];
  const matrixUrls = (b["matrixPhotoUrls"] as string[] | undefined) ?? (b["matrixUrls"] as string[] | undefined) ?? [];
  const itemId = b["itemId"] as string | undefined;
  const matrixSideA = (b["matrixSideA"] as string | undefined)?.trim() || undefined;
  const matrixSideB = (b["matrixSideB"] as string | undefined)?.trim() || undefined;
  const matrixSideCD = (b["matrixSideCD"] as string | undefined)?.trim() || undefined;
  const matrixText = (matrixSideA || matrixSideB || matrixSideCD)
    ? { sideA: matrixSideA, sideB: matrixSideB, sideCD: matrixSideCD }
    : undefined;

  try {
    // Authorization: when itemId is provided, verify the caller owns the item
    // before reading or updating any in-memory state associated with it.
    if (itemId) {
      const ownership = await fetchOwnedListing(itemId, req.user?.id);
      if (ownership.dbError) {
        res.status(503).json({ error: "Service temporarily unavailable." });
        return;
      }
      if (ownership.denied) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    let resolvedLabelUrls = labelUrls;

    // When itemId is provided, retrieve stored label URLs for re-analysis
    if (itemId && !labelUrls.length) {
      const meta = itemMeta.get(itemId);
      if (meta?.photoUrls?.length) {
        resolvedLabelUrls = meta.photoUrls as string[];
      }
    }

    // Run ranked identification (fast — uses xAI + Discogs search)
    const identification = await identifyRecord(resolvedLabelUrls, matrixUrls, matrixText);

    let updatedAnalysis: Record<string, unknown> | null = null;

    // When itemId is provided, re-run full RecordLens pipeline with matrix text injected
    // so listing wording, pricing, and attributes are all updated
    if (itemId && matrixText && resolvedLabelUrls.length) {
      try {
        const fullAnalysis = await runRecordLensAnalysis(resolvedLabelUrls, undefined, {
          matrix_a: matrixText.sideA,
          matrix_b: matrixText.sideB,
        });
        const analysisRecord = fullAnalysis as unknown as Record<string, unknown>;
        studioStore.set(itemId, analysisRecord);
        updatedAnalysis = analysisRecord;

        // Persist refreshed analysis to DB (matching /items/:id/analyse behaviour)
        const ebayTitle = String(
          (analysisRecord.marketplace_outputs as Record<string, unknown> | undefined)
            ?.["ebay"] as string ?? "",
        );
        const identity = analysisRecord.identity as { brand?: string | null; model?: string | null } | undefined;
        const title = ebayTitle || [identity?.brand, identity?.model].filter(Boolean).join(" ") || undefined;
        const pricing = analysisRecord.pricing as { recommended?: number } | undefined;
        const price = pricing?.recommended != null ? String(pricing.recommended) : null;
        const description = (analysisRecord["listing_description"] as string | null) ?? null;
        await db
          .update(listingsTable)
          .set({
            analysis: analysisRecord,
            ...(title ? { title } : {}),
            ...(price ? { price } : {}),
            ...(description ? { description } : {}),
            status: "analysed",
          })
          .where(eq(listingsTable.id, itemId))
          .catch((dbErr) =>
            logger.warn({ dbErr, itemId }, "Could not persist matrix-refreshed analysis to DB (non-fatal)"),
          );
      } catch (pipelineErr) {
        logger.warn({ pipelineErr, itemId }, "Full pipeline re-run failed — returning identification only");
      }
    }

    res.json({
      identification: { ...identification, input_type: "label_and_matrix" },
      ...(updatedAnalysis ? { analysis: updatedAnalysis } : {}),
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
  {
    id: "TechLens",
    name: "TechLens",
    icon: "📱",
    category: "Electronics",
    description:
      "Phones, laptops, cameras and audio gear. Model, condition and accessories.",
    status: "live",
    href: "/lenses/tech",
  },
  {
    id: "BookLens",
    name: "BookLens",
    icon: "📚",
    category: "Books",
    description:
      "Books, first editions and collectable print. ISBN, edition and condition.",
    status: "live",
    href: "/lenses/book",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    icon: "🏺",
    category: "Antiques & Vintage",
    description:
      "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    status: "live",
    href: "/lenses/antiques",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    icon: "✍️",
    category: "Autographs",
    description:
      "Signed items and provenance. Evidence-led — never authenticates signatures.",
    status: "live",
    href: "/lenses/autograph",
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
    const { result: analysis, usage } = await runStudioAnalysis(lensId, photoUrls, combinedHint);
    const userId = req.user?.id ?? null;
    try {
      await db.insert(aiJobLogsTable).values({
        id: newId("aijob"),
        userId,
        jobType: "lens",
        itemId: null,
        checkId: null,
        lens: lensId,
        model: usage.model,
        promptVersion: STUDIO_PROMPT_VERSION,
        schemaVersion: STUDIO_SCHEMA_VERSION,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        estimatedCostPence: estimateCostPence(usage.model, usage.promptTokens, usage.completionTokens),
        confidence: Math.round((analysis.identity?.confidence ?? 0) * 100),
        warnings: analysis.warnings ?? [],
        fullOutput: analysis as unknown as Record<string, unknown>,
      });
    } catch (logErr) {
      logger.warn({ logErr }, "ai_job_logs insert failed (non-fatal)");
    }
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
