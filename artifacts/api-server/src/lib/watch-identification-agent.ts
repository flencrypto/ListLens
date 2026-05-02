/**
 * Watch Identification Intelligence Agent — ListLens WatchLens
 *
 * Focused solely on identifying the likely watch brand, model, reference,
 * movement family, production era, case variant, dial variant, and visible
 * authenticity-risk indicators from extracted evidence and candidates.
 *
 * Responsibilities:
 *   - Evidence-hierarchy scoring
 *   - Candidate ranking with % likelihood
 *   - Conflict detection between photo/OCR evidence and candidates
 *   - Missing evidence prompts
 *   - Reference / serial / movement evidence logic
 *   - Aftermarket / homage / replica-risk indicators
 *   - Safe wording enforcement
 *   - Adjudication between multiple watch candidates
 *
 * NOT responsible for: listing copy, condition grading, pricing, valuation,
 * or formal authentication.
 */

import OpenAI from "openai";
import { logger } from "./logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WatchIdentificationCandidate {
  rank: number;
  brand: string | null;
  model: string | null;
  reference_number: string | null;
  serial_number_partial: string | null;
  movement_type: string | null;
  movement_calibre: string | null;
  case_material: string | null;
  case_size_mm: string | null;
  dial_colour: string | null;
  bracelet_or_strap: string | null;
  production_era: string | null;
  country_or_region: string | null;
  variant_notes: string | null;
  likelihood_percent: number;
  evidence: string[];
  authenticity_risk: "none" | "low" | "medium" | "high";
}

export interface WatchIdentificationAgentResult {
  watch_family: string | null;
  candidates: WatchIdentificationCandidate[];
  conflicts: string[];
  missing_evidence: string[];
  safe_summary: string;
  identification_complete: boolean;
}

export interface WatchIdentificationInput {
  brand: string | null;
  model: string | null;
  reference_number: string | null;
  serial_number_partial: string | null;
  movement_type: string | null;
  movement_calibre: string | null;
  case_material: string | null;
  case_size_mm: string | null;
  dial_colour: string | null;
  bracelet_or_strap: string | null;
  clasp_code: string | null;
  lug_width_mm: string | null;
  production_era: string | null;
  country_or_region: string | null;

  dial_text: string | null;
  caseback_text: string | null;
  movement_text: string | null;
  clasp_text: string | null;
  bracelet_endlink_text: string | null;
  crown_text_or_logo: string | null;
  box_papers_text: string | null;
  readable_text: string;

  visible_features: string[];

  watch_candidates?: Array<{
    source: "Chrono24" | "WatchCharts" | "WatchBase" | "eBay" | "Manufacturer" | "Other";
    product_id?: string | number | null;
    brand: string | null;
    model: string | null;
    reference_number: string | null;
    movement_type: string | null;
    movement_calibre: string | null;
    case_material: string | null;
    case_size_mm: string | null;
    dial_colour: string | null;
    bracelet_or_strap: string | null;
    production_era: string | null;
    country_or_region: string | null;
  }>;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Watch Identification Intelligence Agent for ListLens WatchLens.

YOUR ONLY JOB: Identify the likely watch brand, model, reference, movement family, production era, case variant, dial variant, and visible authenticity-risk indicators from the evidence provided. Do NOT generate listings, valuations, or condition grades. Do NOT provide formal authentication.

## Evidence Hierarchy — most reliable → least reliable
1. Reference number engraved on caseback, inner caseback, between lugs, paperwork, or warranty card.
2. Movement calibre visible on movement plate/rotor or documented in papers.
3. Serial number pattern, partial serial, clasp codes, bracelet/endlink codes.
4. Dial text and logo placement — brand, model, depth rating, chronometer wording, country text.
5. Caseback engravings, hallmarks, material marks, case shape, bezel type, crown guards.
6. Bracelet/clasp/endlink markings.
7. Box and papers — useful only when consistent with the watch itself.
8. Visible construction details — indices, hands, date window, bezel insert, crown, pushers.
9. Seller title or marketplace claim — least reliable.

## Candidate Scoring
Score each candidate based on how well the physical/OCR evidence supports it:
- Reference number confirmed on watch or papers: +35 points
- Movement calibre confirmed: +25 points
- Brand confirmed from dial/case/movement: +15 points
- Model confirmed from dial/caseback/papers: +15 points
- Serial/clasp/endlink pattern consistent: +10 points
- Case material/size confirmed: +10 points
- Dial colour/layout confirmed: +10 points
- Bracelet/strap/endlink confirmed: +10 points
- Production era consistent: +10 points
- Country/region text consistent: +5 points
- Box/papers consistent: +10 points
- Each direct conflict with OCR/photo evidence: −25 points
- Seller/marketplace claim only, with no physical evidence: max confidence 55
Final score capped at 100, floor at 5.

## % Likelihood Meaning
- 90–100%: Strongly supported ID — reference + movement or paperwork + visible watch details agree
- 70–89%: Likely ID — brand/model/reference mostly agree, some physical evidence missing
- 50–69%: Probable watch family — brand/model clear, exact reference/variant uncertain
- 30–49%: Possible — limited evidence, significant ambiguity
- <30%: Low confidence — specific photos required before identification

## Missing Evidence Prompts
When key evidence is absent, add specific prompts to missing_evidence. Be concrete:
- No caseback: "Photograph the caseback straight-on, close enough to read all engravings, reference numbers, serial fragments, hallmarks, and material marks"
- No dial close-up: "Photograph the dial straight-on in sharp focus, including logo, model text, date window, hands, indices, and any lower dial text"
- No movement: "If safe and already open, photograph the movement clearly showing rotor/bridge text and calibre markings. Do not open the watch just for this check"
- No clasp/endlinks: "Photograph the clasp, bracelet codes, and endlink markings clearly"
- No crown: "Photograph the crown from the side, including any logo or engraving"
- No box/papers: "Photograph any warranty card, receipt, service papers, hang tags, box labels, or manuals if present"
- Reference ambiguous: "A readable reference number from the caseback, between the lugs, paperwork, or box label is needed to narrow the exact variant"

## Authenticity / Aftermarket / Replica Risk Indicators
Set authenticity_risk:
- "high": reference conflicts with model, movement calibre inconsistent with claimed model, incorrect dial text/layout for claimed reference, spelling/font issues, mismatched caseback, suspicious logo placement, incorrect date window/cyclops/bezel/crown details, paperwork conflicts with watch
- "medium": reference not visible on a high-value or commonly replicated model, no movement/caseback evidence, box/papers absent or inconsistent, likely aftermarket dial/bezel/bracelet not disclosed
- "low": evidence mostly consistent but key reference/movement/bracelet evidence missing
- "none": no visible authenticity-risk indicators — evidence appears internally consistent

## Conflict Detection
If candidates conflict with evidence:
- Add a clear description to conflicts
- Explain specifically what evidence conflicts with what
- Add the resolving photo to missing_evidence

Examples:
- "Seller title claims Rolex Submariner 16610, but visible dial lacks date/cyclops detail expected for that reference."
- "Caseback reference suggests a different model family than the dial text."
- "Movement text appears quartz, but candidate is listed as automatic."
- "Bracelet/endlink markings do not appear consistent with the claimed reference."

## Adjudication Rules
- Re-rank candidates by physical evidence, not marketplace order.
- Prefer watch-body evidence over box/papers if they conflict.
- Prefer reference and movement evidence over visual similarity.
- If reference number and dial model conflict, flag ambiguity and request caseback, movement, and papers photos.
- If two candidates score within 10 points, flag as ambiguous and request reference, caseback, dial, clasp/endlink, and movement/papers photos.
- If evidence only supports brand/model family but not exact reference, do not overclaim exact reference.
- If seller title conflicts with physical evidence, trust physical evidence.

## Safe Wording Rules — MANDATORY
- NEVER use "definitely", "guaranteed", "confirmed", "100%", "authentic", "genuine", "real", "fake", or "investment-grade" as absolute claims.
- NEVER claim rarity or monetary value.
- NEVER grade condition.
- NEVER provide formal authentication.
- Use: "likely", "consistent with", "evidence suggests", "probable", "appears to be", "authenticity-risk indicators"
- The safe_summary must always state what evidence would improve confidence.
- For risk concerns, say "authenticity-risk indicators" or "authenticity cannot be assessed from the available evidence" — never call the item fake.

## JSON Contract
Return ONLY valid JSON:
{
  "watch_family": "Brand — Model / Reference (approximate era)" or null,
  "candidates": [
    {
      "rank": 1,
      "brand": string | null,
      "model": string | null,
      "reference_number": string | null,
      "serial_number_partial": string | null,
      "movement_type": string | null,
      "movement_calibre": string | null,
      "case_material": string | null,
      "case_size_mm": string | null,
      "dial_colour": string | null,
      "bracelet_or_strap": string | null,
      "production_era": string | null,
      "country_or_region": string | null,
      "variant_notes": string | null,
      "likelihood_percent": number,
      "evidence": ["evidence point 1", "evidence point 2"],
      "authenticity_risk": "none" | "low" | "medium" | "high"
    }
  ],
  "conflicts": ["description of conflicting evidence"],
  "missing_evidence": ["specific photo instruction"],
  "safe_summary": "This is likely [watch family] at [N]% confidence. [Authenticity-risk sentence]. [Next best evidence sentence].",
  "identification_complete": true | false
}

Rank candidates with the highest-scoring candidate at rank 1. Include at most 5 candidates.`;

// ─── Agent function ───────────────────────────────────────────────────────────

export async function runWatchIdentificationAgent(
  input: WatchIdentificationInput,
  client: OpenAI,
  model: string,
): Promise<WatchIdentificationAgentResult> {
  const candidateSection =
    input.watch_candidates?.length
      ? `\n\nWatch database / marketplace candidates — re-rank these by physical evidence:\n${input.watch_candidates
          .map(
            (c, i) =>
              `  ${i + 1}. ${c.source} ${c.product_id ?? "?"}: ${c.brand ?? "?"} — ${c.model ?? "?"} | Ref: ${c.reference_number ?? "?"} | Movement: ${c.movement_type ?? "?"} ${c.movement_calibre ?? ""} | Case: ${c.case_material ?? "?"}, ${c.case_size_mm ?? "?"}mm | Dial: ${c.dial_colour ?? "?"} | Bracelet/strap: ${c.bracelet_or_strap ?? "?"} | Era: ${c.production_era ?? "?"} | Region: ${c.country_or_region ?? "?"}`,
          )
          .join("\n")}`
      : "\n\nWatch database / marketplace candidates: none found — work from physical/OCR evidence only";

  const userText = `Identify this watch from the extracted evidence:

Brand: ${input.brand ?? "not readable"}
Model: ${input.model ?? "not readable"}
Reference number: ${input.reference_number ?? "not readable"}
Partial serial number: ${input.serial_number_partial ?? "not readable"}
Movement type: ${input.movement_type ?? "not readable"}
Movement calibre: ${input.movement_calibre ?? "not readable"}
Case material: ${input.case_material ?? "not readable"}
Case size: ${input.case_size_mm ?? "not readable"}
Dial colour: ${input.dial_colour ?? "not readable"}
Bracelet/strap: ${input.bracelet_or_strap ?? "not readable"}
Clasp code: ${input.clasp_code ?? "not readable"}
Lug width: ${input.lug_width_mm ?? "not readable"}
Production era: ${input.production_era ?? "not readable"}
Country/region: ${input.country_or_region ?? "not readable"}

Dial text: ${input.dial_text ?? "not photographed"}
Caseback text: ${input.caseback_text ?? "not photographed"}
Movement text: ${input.movement_text ?? "not photographed"}
Clasp text: ${input.clasp_text ?? "not photographed"}
Bracelet/endlink text: ${input.bracelet_endlink_text ?? "not photographed"}
Crown text/logo: ${input.crown_text_or_logo ?? "not photographed"}
Box/papers text: ${input.box_papers_text ?? "not photographed"}

Visible features:
${input.visible_features.length ? input.visible_features.map((f) => `- ${f}`).join("\n") : "none"}

Additional readable text:
${input.readable_text || "none"}${candidateSection}

Score each candidate against the physical/OCR evidence, re-rank, and return your identification JSON.`;

  logger.info(
    {
      brand: input.brand,
      model: input.model,
      reference_number: input.reference_number,
      movement_calibre: input.movement_calibre,
      candidate_count: input.watch_candidates?.length ?? 0,
    },
    "WatchIdentificationAgent: starting",
  );

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
    max_tokens: 1800,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<WatchIdentificationAgentResult> = {};

  try {
    parsed = JSON.parse(raw) as Partial<WatchIdentificationAgentResult>;
  } catch (err) {
    logger.warn(
      { err, raw: raw.slice(0, 300) },
      "WatchIdentificationAgent: JSON.parse failed — returning fallback",
    );
  }

  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
  const top = candidates[0];

  const result: WatchIdentificationAgentResult = {
    watch_family:
      parsed.watch_family ??
      (input.brand && input.model ? `${input.brand} — ${input.model}` : null),

    candidates,

    conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],

    missing_evidence: Array.isArray(parsed.missing_evidence)
      ? parsed.missing_evidence
      : [],

    safe_summary:
      parsed.safe_summary ??
      (top
        ? `This is likely ${top.brand ?? "Unknown"} — ${top.model ?? "Unknown"} at ${top.likelihood_percent}% confidence. Exact reference, movement, or variant may need further confirmation. Clear photos of the dial, caseback, clasp/endlinks, papers, and movement if already visible would improve confidence.`
        : "Insufficient evidence to identify this watch. Please photograph the dial, caseback, clasp, bracelet/endlinks, crown, box/papers if present, and movement only if already safely visible."),

    identification_complete: parsed.identification_complete ?? false,
  };

  logger.info(
    {
      watch_family: result.watch_family,
      top_candidate: top
        ? {
            rank: top.rank,
            likelihood: top.likelihood_percent,
            reference_number: top.reference_number,
            movement_calibre: top.movement_calibre,
          }
        : null,
      conflicts: result.conflicts.length,
      missing_evidence: result.missing_evidence.length,
      identification_complete: result.identification_complete,
    },
    "WatchIdentificationAgent: complete",
  );

  return result;
}
