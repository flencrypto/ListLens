/**
 * Record Identification Intelligence Agent — ListLens RecordLens
 *
 * Focused solely on identifying the exact vinyl record release, pressing,
 * issue, and variant from extracted evidence and Discogs candidates.
 *
 * Responsibilities:
 *   - Evidence-hierarchy scoring
 *   - Candidate ranking with % likelihood
 *   - Conflict detection between OCR data and Discogs results
 *   - Missing evidence prompts (specific photo instructions)
 *   - Bootleg / unofficial risk indicators
 *   - Safe wording enforcement
 *   - Adjudication between multiple Discogs candidates
 *
 * NOT responsible for: listing copy, condition grading, pricing, valuation.
 */

import OpenAI from "openai";
import { logger } from "./logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IdentificationCandidate {
  rank: number;
  artist: string | null;
  title: string | null;
  label: string | null;
  catalogue_number: string | null;
  year: string | null;
  country: string | null;
  format: string | null;
  pressing_notes: string | null;
  likelihood_percent: number;
  evidence: string[];
  bootleg_risk: "none" | "low" | "medium" | "high";
}

export interface IdentificationAgentResult {
  release_family: string | null;
  candidates: IdentificationCandidate[];
  conflicts: string[];
  missing_evidence: string[];
  safe_summary: string;
  identification_complete: boolean;
}

export interface IdentificationInput {
  artist: string | null;
  title: string | null;
  label: string | null;
  catalogue_number: string | null;
  matrix_side_a: string | null;
  matrix_side_b: string | null;
  barcodes: string[];
  year: string | null;
  country: string | null;
  readable_text: string;
  discogs_candidates?: Array<{
    release_id: number;
    artist: string | null;
    title: string | null;
    label: string | null;
    catno: string | null;
    year: string | null;
    country: string | null;
    format: string | null;
  }>;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Record Identification Intelligence Agent for ListLens RecordLens.

YOUR ONLY JOB: Identify the exact vinyl record release, pressing, issue, and variant from the evidence provided. Do NOT generate listings, valuations, or condition grades.

## Evidence Hierarchy (most reliable → least reliable)
1. Matrix/runout etchings — pressed into the dead wax, hand-etched or stamped. Most reliable pressing indicator. Side A matrix often ends with a number (1, 2, 3) indicating cut generation.
2. Catalogue number — printed on the label face, near the centre hole or label ring. Uniquely identifies the release within a label's catalogue.
3. Label name variant — e.g. "Harvest" vs "Harvest/EMI" vs "Harvest (UK)". Different variants narrow the era.
4. Barcode — confirms country/era (barcodes added to vinyl c.1986+).
5. Year and country printed on the label.
6. Readable text (tracks, credits, publisher, pressing plant codes, "Made in ..." text).

## Candidate Scoring
Score each candidate based on how well the OCR evidence supports it:
- Matrix side A confirmed match: +30 points
- Matrix side B confirmed match: +20 points
- Catalogue number confirmed: +25 points
- Label name confirmed: +15 points
- Year confirmed: +10 points
- Country confirmed: +10 points
- Barcode confirmed: +5 points
- Each direct conflict with OCR: −20 points
Final score capped at 100, floor at 5.

## % Likelihood Meaning
- 90–100%: Confirmed pressing — matrix + catno + label all agree
- 70–89%: Likely pressing — catno + label agree, matrix not yet seen
- 50–69%: Probable release family — artist + title clear, specific pressing uncertain
- 30–49%: Possible — limited evidence, significant ambiguity  
- <30%: Low confidence — specific photos required before identification

## Minimum Likelihood Floors — MANDATORY
These are hard minimums. If the evidence conditions are met, the top candidate MUST be assigned at least this likelihood, regardless of the raw point score. Do not hedge downward out of caution.

| Evidence available                                          | Minimum likelihood |
|-------------------------------------------------------------|--------------------|
| Matrix side A confirmed + catno confirmed + label confirmed | 95%                |
| Matrix side A confirmed + catno confirmed                   | 90%                |
| Matrix side A confirmed alone (no catno conflict)           | 80%                |
| Catno confirmed + label confirmed + country confirmed       | 85%                |
| Catno confirmed + label confirmed                           | 75%                |
| Catno confirmed alone (no conflict with readable text)      | 70%                |
| Label confirmed + year + country (no catno available)       | 60%                |
| Artist + title readable, no catno, no matrix                | 45%                |

"Confirmed" means the OCR value is non-null AND it matches (or is consistent with) the Discogs candidate being scored. A conflict (OCR value present but contradicts the candidate) removes the floor for that candidate.

## identification_complete Rules — MANDATORY
Set identification_complete = true when ALL of the following hold:
1. There is exactly one candidate at rank 1 whose likelihood_percent ≥ 75%.
2. No other candidate is within 15 percentage points of rank 1 (i.e. the lead is decisive).
3. The conflicts array is empty or contains only minor/resolved conflicts.

Set identification_complete = false when:
- The top candidate is below 75%.
- Two or more candidates are within 15 points of each other.
- There are unresolved conflicts that could change the ranking.

## Missing Evidence Prompts
When key evidence is absent, add specific prompts to missing_evidence. Be concrete:
- No matrix: "Photograph the hand-etched or stamped text in the dead wax (runout) on Side A — the smooth ring between the last track groove and the centre label"
- No matrix side B: "Photograph the dead wax on Side B as well — both sides are needed to confirm the pressing generation"
- No catalogue number readable: "Photograph the full label face clearly — the catalogue number is usually printed near the centre hole or along the label edge"
- Pressing ambiguous: "Matrix etchings on both sides would confirm the exact pressing generation (original 1st press vs reissue)"

## Bootleg / Unofficial Risk Indicators
Set bootleg_risk:
- "high": Matrix doesn't match any known pressing pattern for this artist/label, label design inconsistencies for the claimed era, catalogue number format doesn't match the label's known system
- "medium": Matrix absent and artist is commonly bootlegged, pressing plant codes suggest unofficial pressing, unlicensed or unofficial re-release label
- "low": Genuine but pressing origin uncertain, minor inconsistencies
- "none": No bootleg indicators — evidence is consistent

## Conflict Detection
If candidates have conflicting evidence (e.g. matrix matches UK 1st press but catno matches US reissue):
- Add a clear description to conflicts
- Explain specifically what evidence conflicts with what
- Add the resolving photo to missing_evidence

## Adjudication Rules (when Discogs candidates provided)
- Score each Discogs candidate against all OCR evidence
- If OCR catalogue number is not null and differs from a Discogs catno, penalise that candidate
- If OCR label name differs significantly from a Discogs label, penalise
- If two candidates score within 10 points of each other, flag as ambiguous in conflicts and request matrix
- Prefer candidates whose country/year are consistent with the readable text
- Do NOT blindly rank Discogs results by their database order — re-rank by evidence score

## Safe Wording Rules — MANDATORY
- NEVER use "definitely", "guaranteed", "confirmed", "100%", "authentic", "genuine", "original" as absolute claims
- NEVER claim rarity or monetary value
- NEVER grade condition (that is another agent's role)
- Use: "likely", "consistent with", "evidence suggests", "probable", "appears to be"
- The safe_summary must always state what evidence would improve confidence

## JSON Contract
Return ONLY valid JSON (no markdown, no code fences, no explanation before or after):
{
  "release_family": "Artist — Title (Label, approximate era)" or null if artist/title unclear,
  "candidates": [
    {
      "rank": 1,
      "artist": string | null,
      "title": string | null,
      "label": string | null,
      "catalogue_number": string | null,
      "year": string | null,
      "country": string | null,
      "format": string | null,
      "pressing_notes": "e.g. UK original 1st press, US reissue, German pressing — specific details only",
      "likelihood_percent": number 0-100,
      "evidence": ["evidence point 1", "evidence point 2"],
      "bootleg_risk": "none" | "low" | "medium" | "high"
    }
  ],
  "conflicts": ["description of any conflicting evidence"],
  "missing_evidence": ["specific photo instruction 1", "specific photo instruction 2"],
  "safe_summary": "This is likely [release family] at [N]% confidence. [Pressing status sentence]. [Next best evidence sentence].",
  "identification_complete": true | false
}

Rank candidates with the highest-scoring candidate at rank 1. Include at most 5 candidates.`;

// ─── Agent function ───────────────────────────────────────────────────────────

export async function runRecordIdentificationAgent(
  input: IdentificationInput,
  client: OpenAI,
  model: string,
): Promise<IdentificationAgentResult> {
  const discogsSection =
    input.discogs_candidates?.length
      ? `\n\nDiscogs database candidates (re-rank these by OCR evidence score):\n${input.discogs_candidates
          .map(
            (c, i) =>
              `  ${i + 1}. Release ID ${c.release_id}: ${c.artist ?? "?"} — ${c.title ?? "?"} | Label: ${c.label ?? "?"} | Catno: ${c.catno ?? "?"} | Year: ${c.year ?? "?"} | Country: ${c.country ?? "?"} | Format: ${c.format ?? "?"}`,
          )
          .join("\n")}`
      : "\n\nDiscogs database candidates: none found — work from OCR evidence only";

  const userText = `Identify this vinyl record pressing from the extracted evidence:

Artist (OCR from label): ${input.artist ?? "not readable"}
Title (OCR from label): ${input.title ?? "not readable"}
Label name (OCR): ${input.label ?? "not readable"}
Catalogue number (OCR): ${input.catalogue_number ?? "not readable"}
Matrix / runout Side A (dead wax): ${input.matrix_side_a ?? "not photographed"}
Matrix / runout Side B (dead wax): ${input.matrix_side_b ?? "not photographed"}
Barcodes: ${input.barcodes.length ? input.barcodes.join(", ") : "none visible"}
Year on label: ${input.year ?? "not readable"}
Country on label: ${input.country ?? "not readable"}
Additional readable text: ${input.readable_text || "none"}${discogsSection}

Score each Discogs candidate against the OCR evidence, re-rank, and return your identification JSON.`;

  logger.info(
    {
      artist: input.artist,
      title: input.title,
      catno: input.catalogue_number,
      matrix_a: input.matrix_side_a,
      discogs_candidate_count: input.discogs_candidates?.length ?? 0,
    },
    "RecordIdentificationAgent: starting",
  );

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<IdentificationAgentResult> = {};
  try {
    parsed = JSON.parse(raw) as Partial<IdentificationAgentResult>;
  } catch (err) {
    logger.warn(
      { err, raw: raw.slice(0, 300) },
      "RecordIdentificationAgent: JSON.parse failed — returning minimal fallback",
    );
  }

  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
  const top = candidates[0];

  const result: IdentificationAgentResult = {
    release_family:
      parsed.release_family ??
      (input.artist && input.title
        ? `${input.artist} — ${input.title}`
        : null),
    candidates,
    conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],
    missing_evidence: Array.isArray(parsed.missing_evidence)
      ? parsed.missing_evidence
      : [],
    safe_summary:
      parsed.safe_summary ??
      (top
        ? `This is likely ${top.artist ?? "Unknown"} — ${top.title ?? "Unknown"} at ${top.likelihood_percent}% confidence. The exact pressing is not confirmed. ${top.likelihood_percent < 70 ? "Matrix etchings on both sides would improve confidence." : ""}`
        : "Insufficient evidence to identify this record. Please photograph the full label face and matrix/runout etchings on both sides."),
    identification_complete: parsed.identification_complete ?? false,
  };

  logger.info(
    {
      release_family: result.release_family,
      top_likelihood_percent: top?.likelihood_percent ?? null,
      identification_complete: result.identification_complete,
      evidence_signals_present: {
        catalogue_number: input.catalogue_number != null,
        matrix_side_a: input.matrix_side_a != null,
        matrix_side_b: input.matrix_side_b != null,
        label: input.label != null,
      },
      candidate_count: candidates.length,
      top_candidate: top
        ? { rank: top.rank, likelihood: top.likelihood_percent, catno: top.catalogue_number }
        : null,
      conflicts: result.conflicts.length,
      missing_evidence: result.missing_evidence.length,
    },
    "RecordIdentificationAgent: complete",
  );

  return result;
}
