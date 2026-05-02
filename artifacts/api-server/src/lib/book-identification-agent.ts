/**
 * Book Identification Intelligence Agent — ListLens BookLens
 *
 * Focused solely on identifying the exact book edition, printing,
 * issue, binding variant, publisher variant, and ISBN/catalogue identity
 * from extracted evidence and marketplace/database candidates.
 *
 * Responsibilities:
 *   - Evidence-hierarchy scoring
 *   - Candidate ranking with % likelihood
 *   - Conflict detection between OCR/photo evidence and candidates
 *   - Missing evidence prompts
 *   - First edition / later printing risk indicators
 *   - Facsimile / book club / reprint risk indicators
 *   - Safe wording enforcement
 *   - Adjudication between multiple book candidates
 *
 * NOT responsible for: listing copy, condition grading, pricing, valuation.
 */

import OpenAI from "openai";
import { logger } from "./logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookIdentificationCandidate {
  rank: number;
  title: string | null;
  author: string | null;
  publisher: string | null;
  imprint: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  publication_year: string | null;
  printing_statement: string | null;
  edition_statement: string | null;
  country_or_region: string | null;
  binding: string | null;
  format: string | null;
  variant_notes: string | null;
  likelihood_percent: number;
  evidence: string[];
  reprint_or_facsimile_risk: "none" | "low" | "medium" | "high";
}

export interface BookIdentificationAgentResult {
  book_family: string | null;
  candidates: BookIdentificationCandidate[];
  conflicts: string[];
  missing_evidence: string[];
  safe_summary: string;
  identification_complete: boolean;
}

export interface BookIdentificationInput {
  title: string | null;
  author: string | null;
  publisher: string | null;
  imprint: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  barcode: string | null;
  publication_year: string | null;
  edition_statement: string | null;
  printing_statement: string | null;
  number_line: string | null;
  country_or_region: string | null;
  binding: string | null;
  format: string | null;

  copyright_page_text: string | null;
  title_page_text: string | null;
  dust_jacket_text: string | null;
  spine_text: string | null;
  cover_text: string | null;
  price_clipped_or_jacket_price: string | null;
  library_marks_or_ex_libris: string | null;
  readable_text: string;

  visible_features: string[];

  book_candidates?: Array<{
    source: "GoogleBooks" | "OpenLibrary" | "WorldCat" | "AbeBooks" | "eBay" | "Amazon" | "Other";
    product_id?: string | number | null;
    title: string | null;
    author: string | null;
    publisher: string | null;
    imprint: string | null;
    isbn_10: string | null;
    isbn_13: string | null;
    publication_year: string | null;
    edition_statement: string | null;
    binding: string | null;
    format: string | null;
    country_or_region: string | null;
  }>;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Book Identification Intelligence Agent for ListLens BookLens.

YOUR ONLY JOB: Identify the exact book edition, printing, issue, binding variant, publisher variant, ISBN identity, and likely publication family from the evidence provided. Do NOT generate listings, valuations, or condition grades.

## Evidence Hierarchy — most reliable → least reliable
1. Copyright page / publication data page — strongest evidence for publisher, edition, printing, ISBN, publication year, number line, and country.
2. Number line / printer’s key — strongest evidence for printing generation. Example: 10 9 8 7 6 5 4 3 2 1 often indicates first printing if publisher convention supports it.
3. ISBN-13 / ISBN-10 / barcode — strong edition identifier, especially modern books.
4. Title page — stronger than cover for title, author, publisher/imprint.
5. Dust jacket flap price / jacket text — helps distinguish trade edition, book club edition, later jacket, or price-clipped copy.
6. Publisher/imprint logo and address — can narrow era and region.
7. Binding and format — hardback, paperback, mass market paperback, trade paperback, library binding, book club edition.
8. Cover/spine text — useful but less reliable than title/copyright page.
9. Marketplace title or seller claim — least reliable.

## Candidate Scoring
Score each candidate based on how well the physical/OCR evidence supports it:
- ISBN-13 confirmed: +30 points
- ISBN-10 confirmed: +25 points
- Title confirmed from title page: +15 points
- Author confirmed from title page: +15 points
- Publisher/imprint confirmed: +15 points
- Publication year confirmed: +10 points
- Edition statement confirmed: +15 points
- Printing statement / number line confirmed: +20 points
- Binding/format confirmed: +10 points
- Country/region confirmed: +5 points
- Dust jacket price/flap detail consistent: +10 points
- Each direct conflict with OCR/photo evidence: −20 points
- Marketplace/seller claim only, with no copyright/title page evidence: max confidence 60
Final score capped at 100, floor at 5.

## % Likelihood Meaning
- 90–100%: Strongly supported edition/printing — ISBN or publication page + publisher + title/author + printing evidence agree
- 70–89%: Likely edition — title/author/publisher agree, exact printing or issue may be incomplete
- 50–69%: Probable book family — title and author clear, exact edition/printing uncertain
- 30–49%: Possible — limited evidence, significant ambiguity
- <30%: Low confidence — specific photos required before identification

## Missing Evidence Prompts
When key evidence is absent, add specific prompts to missing_evidence. Be concrete:
- No copyright page: "Photograph the copyright/publication page clearly — this usually contains the ISBN, publisher, edition statement, printing line, and publication year"
- No title page: "Photograph the full title page showing title, author, publisher, and imprint"
- No number line: "Photograph the lower section of the copyright page where the number line or printer’s key may appear"
- No dust jacket flap: "Photograph the inside front dust jacket flap showing price, edition text, and publisher blurb"
- No spine: "Photograph the spine straight-on so the publisher/imprint and title can be checked"
- No barcode: "Photograph the rear cover or jacket barcode area clearly"
- First edition ambiguous: "A clear copyright page and number line are needed before suggesting first edition or first printing status"

## First Edition / Printing Caution
Be extremely careful with first edition wording.
- Do NOT call a book a first edition unless the evidence supports the edition statement and printing/number-line convention.
- If number line is incomplete or absent, say "first edition status is not established from the available evidence."
- If the edition statement says first edition but the number line suggests later printing, flag a conflict.
- If the jacket appears later than the book or price is clipped, flag the uncertainty.

## Reprint / Facsimile / Book Club Risk Indicators
Set reprint_or_facsimile_risk:
- "high": ISBN/year conflicts with claimed early edition, modern barcode on supposedly pre-ISBN edition, facsimile statement, book club markings, missing price on jacket where expected, publisher details inconsistent with claimed era
- "medium": copyright page absent, seller claims first edition without number line, dust jacket missing or replaced, book club indicators possible
- "low": evidence mostly consistent but key printing/issue evidence missing
- "none": no visible reprint/facsimile/book-club indicators — evidence is consistent

## Conflict Detection
If candidates conflict with evidence:
- Add a clear description to conflicts
- Explain specifically what evidence conflicts with what
- Add the resolving photo to missing_evidence

Examples:
- "Seller title claims first edition, but no copyright page or number line is visible."
- "ISBN points to a later paperback edition, while candidate is a hardback first edition."
- "Publication year visible as 1987, but candidate record is for a 1994 reprint."
- "Dust jacket price is absent where a trade first edition would usually have a printed price."

## Adjudication Rules
- Re-rank candidates by physical evidence, not marketplace order.
- Prefer copyright/title page evidence over cover or seller title.
- Prefer ISBN match over visual cover match for modern books.
- For pre-ISBN books, rely on publisher, date, edition statement, jacket price, binding, title page, and printing notes.
- If two candidates score within 10 points, flag as ambiguous and request copyright page, title page, number line, and jacket flap.
- If evidence only supports title/author but not edition, do not overclaim edition or printing.
- If seller title conflicts with copyright page evidence, trust copyright page evidence.

## Safe Wording Rules — MANDATORY
- NEVER use "definitely", "guaranteed", "confirmed", "100%", "authentic", "genuine", "true first", or "rare" as absolute claims.
- NEVER claim monetary value.
- NEVER grade condition.
- Use: "likely", "consistent with", "evidence suggests", "probable", "appears to be", "first edition status is not established"
- The safe_summary must always state what evidence would improve confidence.
- For risky claims, say "reprint/facsimile/book-club indicators" or "edition status cannot be assessed from the available evidence."

## JSON Contract
Return ONLY valid JSON:
{
  "book_family": "Author — Title (Publisher/Imprint, approximate year)" or null,
  "candidates": [
    {
      "rank": 1,
      "title": string | null,
      "author": string | null,
      "publisher": string | null,
      "imprint": string | null,
      "isbn_10": string | null,
      "isbn_13": string | null,
      "publication_year": string | null,
      "printing_statement": string | null,
      "edition_statement": string | null,
      "country_or_region": string | null,
      "binding": string | null,
      "format": string | null,
      "variant_notes": string | null,
      "likelihood_percent": number,
      "evidence": ["evidence point 1", "evidence point 2"],
      "reprint_or_facsimile_risk": "none" | "low" | "medium" | "high"
    }
  ],
  "conflicts": ["description of conflicting evidence"],
  "missing_evidence": ["specific photo instruction"],
  "safe_summary": "This is likely [book family] at [N]% confidence. [Edition/printing status sentence]. [Next best evidence sentence].",
  "identification_complete": true | false
}

Rank candidates with the highest-scoring candidate at rank 1. Include at most 5 candidates.`;

// ─── Agent function ───────────────────────────────────────────────────────────

export async function runBookIdentificationAgent(
  input: BookIdentificationInput,
  client: OpenAI,
  model: string,
): Promise<BookIdentificationAgentResult> {
  const candidateSection =
    input.book_candidates?.length
      ? `\n\nBook database / marketplace candidates — re-rank these by physical evidence:\n${input.book_candidates
          .map(
            (c, i) =>
              `  ${i + 1}. ${c.source} ${c.product_id ?? "?"}: ${c.author ?? "?"} — ${c.title ?? "?"} | Publisher: ${c.publisher ?? "?"} | Imprint: ${c.imprint ?? "?"} | ISBN-10: ${c.isbn_10 ?? "?"} | ISBN-13: ${c.isbn_13 ?? "?"} | Year: ${c.publication_year ?? "?"} | Edition: ${c.edition_statement ?? "?"} | Binding: ${c.binding ?? "?"} | Format: ${c.format ?? "?"} | Region: ${c.country_or_region ?? "?"}`,
          )
          .join("\n")}`
      : "\n\nBook database / marketplace candidates: none found — work from physical/OCR evidence only";

  const userText = `Identify this book edition/printing from the extracted evidence:

Title: ${input.title ?? "not readable"}
Author: ${input.author ?? "not readable"}
Publisher: ${input.publisher ?? "not readable"}
Imprint: ${input.imprint ?? "not readable"}
ISBN-10: ${input.isbn_10 ?? "not readable"}
ISBN-13: ${input.isbn_13 ?? "not readable"}
Barcode: ${input.barcode ?? "none visible"}
Publication year: ${input.publication_year ?? "not readable"}
Edition statement: ${input.edition_statement ?? "not readable"}
Printing statement: ${input.printing_statement ?? "not readable"}
Number line / printer’s key: ${input.number_line ?? "not readable"}
Country/region: ${input.country_or_region ?? "not readable"}
Binding: ${input.binding ?? "not readable"}
Format: ${input.format ?? "not readable"}

Copyright/publication page text: ${input.copyright_page_text ?? "not photographed"}
Title page text: ${input.title_page_text ?? "not photographed"}
Dust jacket text: ${input.dust_jacket_text ?? "not photographed"}
Spine text: ${input.spine_text ?? "not photographed"}
Cover text: ${input.cover_text ?? "not photographed"}
Jacket price / price-clipped detail: ${input.price_clipped_or_jacket_price ?? "not photographed"}
Library marks / ex-libris detail: ${input.library_marks_or_ex_libris ?? "not visible"}

Visible features:
${input.visible_features.length ? input.visible_features.map((f) => `- ${f}`).join("\n") : "none"}

Additional readable text:
${input.readable_text || "none"}${candidateSection}

Score each candidate against the physical/OCR evidence, re-rank, and return your identification JSON.`;

  logger.info(
    {
      title: input.title,
      author: input.author,
      publisher: input.publisher,
      isbn_10: input.isbn_10,
      isbn_13: input.isbn_13,
      candidate_count: input.book_candidates?.length ?? 0,
    },
    "BookIdentificationAgent: starting",
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

  let parsed: Partial<BookIdentificationAgentResult> = {};

  try {
    parsed = JSON.parse(raw) as Partial<BookIdentificationAgentResult>;
  } catch (err) {
    logger.warn(
      { err, raw: raw.slice(0, 300) },
      "BookIdentificationAgent: JSON.parse failed — returning fallback",
    );
  }

  const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
  const top = candidates[0];

  const result: BookIdentificationAgentResult = {
    book_family:
      parsed.book_family ??
      (input.author && input.title ? `${input.author} — ${input.title}` : null),

    candidates,

    conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],

    missing_evidence: Array.isArray(parsed.missing_evidence)
      ? parsed.missing_evidence
      : [],

    safe_summary:
      parsed.safe_summary ??
      (top
        ? `This is likely ${top.author ?? "Unknown"} — ${top.title ?? "Unknown"} at ${top.likelihood_percent}% confidence. Exact edition or printing may need further confirmation. A clear copyright page, title page, number line, and dust jacket flap would improve confidence.`
        : "Insufficient evidence to identify this book edition. Please photograph the title page, copyright/publication page, number line, spine, rear barcode, and dust jacket flaps if present."),

    identification_complete: parsed.identification_complete ?? false,
  };

  logger.info(
    {
      book_family: result.book_family,
      top_candidate: top
        ? {
            rank: top.rank,
            likelihood: top.likelihood_percent,
            isbn_10: top.isbn_10,
            isbn_13: top.isbn_13,
            publication_year: top.publication_year,
          }
        : null,
      conflicts: result.conflicts.length,
      missing_evidence: result.missing_evidence.length,
      identification_complete: result.identification_complete,
    },
    "BookIdentificationAgent: complete",
  );

  return result;
}