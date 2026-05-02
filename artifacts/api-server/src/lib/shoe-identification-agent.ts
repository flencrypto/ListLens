/**
 * Shoe / Sneaker Identification Intelligence Agent — ListLens SoleLens
 *
 * Focused solely on identifying the exact shoe / sneaker model, colourway,
 * SKU/style code, release variant, and likely issue from extracted evidence
 * and marketplace/database candidates.
 *
 * Responsibilities:
 *   - Evidence-hierarchy scoring
 *   - Candidate ranking with % likelihood
 *   - Conflict detection between OCR/photo evidence and candidates
 *   - Missing evidence prompts with specific photo instructions
 *   - Replica / counterfeit risk indicators
 *   - Safe wording enforcement
 *   - Adjudication between multiple sneaker candidates
 *
 * NOT responsible for: listing copy, condition grading, pricing, valuation.
 */

import OpenAI from "openai";
import { logger } from "./logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShoeIdentificationCandidate {
  rank: number;
  brand: string | null;
  model: string | null;
  colourway: string | null;
  style_code: string | null;
  sku: string | null;
  size: string | null;
  gender_category: string | null;
  release_year: string | null;
  country_or_region: string | null;
  product_line: string | null;
  variant_notes: string | null;
  likelihood_percent: number;
  evidence: string[];
  replica_risk: "none" | "low" | "medium" | "high";
}

export interface ShoeIdentificationAgentResult {
  product_family: string | null;
  candidates: ShoeIdentificationCandidate[];
  conflicts: string[];
  missing_evidence: string[];
  safe_summary: string;
  identification_complete: boolean;
}

export interface ShoeIdentificationInput {
  brand: string | null;
  model: string | null;
  colourway: string | null;
  style_code: string | null;
  sku: string | null;
  upc: string | null;
  size: string | null;
  gender_category: string | null;
  release_year: string | null;
  country_or_region: string | null;

  box_label_text: string | null;
  size_label_text: string | null;
  insole_text: string | null;
  outsole_text: string | null;
  tongue_label_text: string | null;
  heel_text: string | null;
  readable_text: string;

  visible_features: string[];

  marketplace_candidates?: Array<{
    source: "StockX" | "GOAT" | "eBay" | "Vinted" | "Nike" | "Adidas" | "KicksCrew" | "Other";
    product_id?: string | number | null;
    brand: string | null;
    model: string | null;
    colourway: string | null;
    style_code: string | null;
    sku: string | null;
    size: string | null;
    gender_category: string | null;
    release_year: string | null;
    product_line: string | null;
    title?: string | null;
    retail_price?: number | null;
    price?: number | null;
    currency?: string | null;
    sizes?: string[];
    image_url?: string | null;
    product_url?: string | null;
    evidence?: string[];
  }>;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Shoe / Sneaker Identification Intelligence Agent for ListLens SoleLens.

YOUR ONLY JOB: Identify the exact shoe / sneaker model, colourway, SKU/style code, size category, release variant, and likely issue from the evidence provided. Do NOT generate listings, valuations, or condition grades.

## Evidence Hierarchy — most reliable → least reliable
1. Size label / tongue label SKU or style code — the strongest product identifier. Examples: Nike DD1391-100, Adidas HQ4540, New Balance M990GL5.
2. Box label SKU / UPC / barcode — strong confirmation if box appears matched to the shoes.
3. Brand + model text on shoe / insole / outsole / heel / tongue.
4. Colourway name or visible colour/material pattern.
5. Construction details — sole unit, panel layout, stitching, logo placement, eyelets, heel tab, toe box shape.
6. Release year / regional text on label.
7. Marketplace title or seller claim.
8. General visual similarity.

## Candidate Scoring
Score each candidate based on how well the evidence supports it:
- Style code / SKU confirmed from size label: +35 points
- Box label SKU confirmed and matches shoe evidence: +25 points
- UPC/barcode confirmed: +10 points
- Brand confirmed: +10 points
- Model confirmed: +15 points
- Colourway confirmed: +15 points
- Size/gender category confirmed: +10 points
- Release year or region confirmed: +5 points
- Construction details consistent: +10 points
- Each direct conflict with OCR/photo evidence: −20 points
- Seller/marketplace title only, with no physical evidence: max confidence 60
Final score capped at 100, floor at 5.

## % Likelihood Meaning
- 90–100%: Strongly supported ID — style code/SKU + model + colourway agree
- 70–89%: Likely ID — model/colourway agree, SKU or box evidence incomplete
- 50–69%: Probable product family — brand/model clear, exact colourway/SKU uncertain
- 30–49%: Possible — limited evidence, significant ambiguity
- <30%: Low confidence — specific photos required before identification

## Missing Evidence Prompts
When key evidence is absent, add specific prompts to missing_evidence. Be concrete:
- No size label: "Photograph the size/tongue label inside each shoe clearly — this usually contains the SKU/style code needed to identify the exact model and colourway"
- No box label: "Photograph the full box label showing SKU, size, barcode/UPC, colourway text, and any product code"
- No outsole: "Photograph the soles/outsoles from above, straight-on — tread pattern and logo placement help confirm the model"
- No heel: "Photograph the heel tabs and rear logos on both shoes"
- No insole: "Photograph the insoles and inside branding if removable or visible"
- Replica risk unclear: "Add close-ups of stitching, tongue label, size label print, heel embroidery, outsole logo, and box label"

## Replica / Counterfeit Risk Indicators
Set replica_risk:
- "high": SKU/style code conflicts with model or colourway, box label mismatch, incorrect logo placement, wrong sole unit, obvious construction mismatch, spelling/font inconsistencies, seller claims conflict with physical evidence
- "medium": SKU absent on high-risk sneaker, box absent or mismatched, common replica model, missing critical label photos, unclear stitching/logo evidence
- "low": Evidence mostly consistent but some confirmation missing
- "none": No replica-risk indicators visible — evidence is consistent

## Conflict Detection
If candidates conflict with evidence:
- Add a clear description to conflicts
- Explain specifically what evidence conflicts with what
- Add the resolving photo to missing_evidence

Examples:
- "Size label style code DD1391-100 points to Nike Dunk Low White/Black, but seller title claims Air Jordan 1."
- "Box label size does not match the shoe size label."
- "Candidate colourway is University Blue, but visible shoe panels appear Black/White."

## Adjudication Rules
- Re-rank candidates by physical evidence, not marketplace order.
- Prefer candidates matching SKU/style code from the shoe label over box-only evidence.
- If box and shoe labels conflict, treat shoe label as stronger unless the shoe label is unreadable.
- If two candidates score within 10 points, flag as ambiguous and request SKU/size label and outsole photos.
- If evidence only supports brand/model but not colourway, do not overclaim the exact colourway.
- If seller title conflicts with label evidence, trust label evidence.

## Safe Wording Rules — MANDATORY
- NEVER use "definitely", "guaranteed", "confirmed", "100%", "authentic", "genuine", "real", or "fake" as absolute claims.
- NEVER claim rarity or monetary value.
- NEVER grade condition.
- Use: "likely", "consistent with", "evidence suggests", "probable", "appears to be", "replica-risk indicators"
- The safe_summary must always state what evidence would improve confidence.
- For replica concerns, say "replica-risk indicators" or "authenticity cannot be assessed from the available evidence" — never call the item fake.

## JSON Contract
Return ONLY valid JSON:
{
  "product_family": "Brand — Model Colourway (SKU/style code, approximate release year)" or null,
  "candidates": [
    {
      "rank": 1,
      "brand": string | null,
      "model": string | null,
      "colourway": string | null,
      "style_code": string | null,
      "sku": string | null,
      "size": string | null,
      "gender_category": string | null,
      "release_year": string | null,
      "country_or_region": string | null,
      "product_line": string | null,
      "variant_notes": string | null,
      "likelihood_percent": number,
      "evidence": ["evidence point 1", "evidence point 2"],
      "replica_risk": "none" | "low" | "medium" | "high"
    }
  ],
  "conflicts": ["description of conflicting evidence"],
  "missing_evidence": ["specific photo instruction"],
  "safe_summary": "This is likely [product family] at [N]% confidence. [Replica-risk sentence]. [Next best evidence sentence].",
  "identification_complete": true | false
}

Rank candidates with the highest-scoring candidate at rank 1. Include at most 5 candidates.`;

// ─── Agent function ───────────────────────────────────────────────────────────

export async function runShoeIdentificationAgent(
  input: ShoeIdentificationInput,
  client: OpenAI,
  model: string,
): Promise<ShoeIdentificationAgentResult> {
  const candidateSection =
    input.marketplace_candidates?.length
      ? `\n\nMarketplace/database candidates — re-rank these by physical evidence:\n${input.marketplace_candidates
          .map(
            (c, i) =>
              `  ${i + 1}. ${c.source} ${c.product_id ?? "?"}: ${c.brand ?? "?"} — ${c.model ?? c.title ?? "?"} | Colourway: ${c.colourway ?? "?"} | Style/SKU: ${c.style_code ?? c.sku ?? "?"} | Size: ${c.size ?? "?"} | Sizes: ${c.sizes?.join(", ") ?? "?"} | Gender: ${c.gender_category ?? "?"} | Year: ${c.release_year ?? "?"} | Line: ${c.product_line ?? "?"} | Price: ${c.currency ?? ""}${c.retail_price ?? c.price ?? "?"} | URL: ${c.product_url ?? "?"}`,
          )
          .join("\n")}`
      : "\n\nMarketplace/database candidates: none found — work from physical/OCR evidence only";

  const userText = `Identify this shoe/sneaker from the extracted evidence:

Brand: ${input.brand ?? "not readable"}
Model: ${input.model ?? "not readable"}
Colourway: ${input.colourway ?? "not readable"}
Style code: ${input.style_code ?? "not readable"}
SKU: ${input.sku ?? "not readable"}
UPC/barcode: ${input.upc ?? "none visible"}
Size: ${input.size ?? "not readable"}
Gender/category: ${input.gender_category ?? "not readable"}
Release year: ${input.release_year ?? "not readable"}
Country/region: ${input.country_or_region ?? "not readable"}

Box label text: ${input.box_label_text ?? "not photographed"}
Size/tongue label text: ${input.size_label_text ?? "not photographed"}
Insole text: ${input.insole_text ?? "not photographed"}
Outsole text: ${input.outsole_text ?? "not photographed"}
Tongue label text: ${input.tongue_label_text ?? "not photographed"}
Heel text: ${input.heel_text ?? "not photographed"}

Visible features:
${input.visible_features.length ? input.visible_features.map((f) => `- ${f}`).join("\n") : "none"}

Additional readable text:
${input.readable_text || "none"}${candidateSection}

Score each candidate against the physical/OCR evidence, re-rank, and return your identification JSON.`;

  logger.info(
    {
      brand: input.brand,
      model: input.model,
      style_code: input.style_code,
      sku: input.sku,
      candidate_count: input.marketplace_candidates?.length ?? 0,
    },
    "ShoeIdentificationAgent: starting",
  );

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
    max_tokens: 1700,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<ShoeIdentificationAgentResult> = {};

  try {
    parsed = JSON.parse(raw) as Partial<ShoeIdentificationAgentResult>;
  } catch (err) {
    logger.warn(
      { err, raw: raw.slice(0, 300) },
      "ShoeIdentificationAgent: JSON.parse failed — returning fallback",
    );
  }

  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
  const top = candidates[0];

  const result: ShoeIdentificationAgentResult = {
    product_family:
      parsed.product_family ??
      (input.brand && input.model ? `${input.brand} — ${input.model}` : null),

    candidates,

    conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],

    missing_evidence: Array.isArray(parsed.missing_evidence)
      ? parsed.missing_evidence
      : [],

    safe_summary:
      parsed.safe_summary ??
      (top
        ? `This is likely ${top.brand ?? "Unknown"} — ${top.model ?? "Unknown"} at ${top.likelihood_percent}% confidence. Exact colourway or variant may need further confirmation. A clear photo of the size/tongue label and box label would improve confidence.`
        : "Insufficient evidence to identify this shoe. Please photograph the size/tongue label, box label, outsole, heel, insole, and both side profiles."),

    identification_complete: parsed.identification_complete ?? false,
  };

  logger.info(
    {
      product_family: result.product_family,
      top_candidate: top
        ? {
            rank: top.rank,
            likelihood: top.likelihood_percent,
            style_code: top.style_code,
            sku: top.sku,
          }
        : null,
      conflicts: result.conflicts.length,
      missing_evidence: result.missing_evidence.length,
      identification_complete: result.identification_complete,
    },
    "ShoeIdentificationAgent: complete",
  );

  return result;
}