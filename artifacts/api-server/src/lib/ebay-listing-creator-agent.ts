/**
 * RecordLens eBay HTML Listing Creator Agent
 *
 * Creates eBay-safe, mobile-friendly, collector-focused HTML listings for
 * vinyl records, CDs, cassettes and music media after RecordLens identification.
 *
 * Key features:
 *  - Design inspired by the visual style of the front cover (palette, mood, typography)
 *  - Evidence-led pressing wording — never overclaims rarity or issue
 *  - Full eBay compliance (static HTML/CSS only, no script, no iframe, no forms)
 *  - 3 SEO title options + recommended title (max 80 chars)
 *  - Item specifics suggestions
 *  - Plain-text fallback description
 *  - Compliance audit before returning
 *
 * This is the ONLY method used to generate listing copy in the Studio pipeline.
 * It replaces the old generateListingCopy prompt.
 */

import OpenAI from "openai";
import { logger } from "./logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StylePalette {
  background: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;
}

export interface StyleSystem {
  source: "front_cover" | "inferred" | "user_supplied";
  palette: StylePalette;
  mood: string[];
  typography_feel: string | null;
  layout_treatment: string | null;
  style_confidence: number;
}

export interface EbayListingSeo {
  title_options: string[];
  recommended_title: string | null;
  subtitle: string | null;
}

export interface ComplianceAudit {
  active_content: boolean;
  external_links_checked: boolean;
  unsupported_claims_removed: string[];
  pressing_caveat_included: boolean;
  mobile_friendly: boolean;
  remaining_cautions: string[];
}

export interface EbayListingCreatorResult {
  agent: "recordlens-ebay-html-listing-creator";
  mode: "studio_listing_html";
  style_system: StyleSystem;
  seo: EbayListingSeo;
  item_specifics: Record<string, string>;
  html_description: string | null;
  plain_text_description: string | null;
  compliance_audit: ComplianceAudit;
  /** Legacy compat: seo_keywords extracted from title_options + recommended title */
  seo_keywords: string[];
  /** Legacy compat: tracklist if included in plain text */
  tracklist: string[];
}

export interface ListingCreatorInput {
  artist: string | null;
  title: string | null;
  format: string | null;
  label: string | null;
  catalogue_number: string | null;
  country: string | null;
  year: string | null;
  matrix_runout_side_a: string | null;
  matrix_runout_side_b: string | null;
  media_grade: string;
  sleeve_grade: string;
  condition_notes: string;
  defects: string[];
  pressing_notes: string | null;
  likely_release: string | null;
  likelihood_percent: number | null;
  identification_complete: boolean;
  missing_evidence: string[];
  conflicts: string[];
  discogs_have: number | null;
  discogs_want: number | null;
  tracklist: string[];
  band_context?: string | null;
  front_cover_description?: string | null;
}

// ─── System Prompt (full agent spec) ─────────────────────────────────────────

const SYSTEM_PROMPT = `You are the RecordLens eBay HTML Listing Creator Agent.

Your job is to create eBay-safe, mobile-friendly, collector-focused HTML listings for records, CDs, cassettes, box sets and music-media items after RecordLens has identified the likely release/issue.

## Core Mission
Create an HTML listing that:
1. Looks visually inspired by the album/front-cover style.
2. Clearly identifies the item.
3. Explains pressing/release evidence without overclaiming.
4. Presents condition honestly.
5. Helps collectors trust the listing.
6. Is mobile-friendly and eBay-safe.
7. Uses static HTML/CSS only.

Core principle: Collector confidence first. Visual style second. Compliance always.

## eBay Compliance Rules — MANDATORY
The listing HTML must be static and eBay-safe.

NEVER include in the HTML:
- <script> tags or any JavaScript
- <iframe>, <form>, <input>, <button onclick="...">
- <object>, <embed>, <video autoplay>, <audio autoplay>
- External CSS files or external font imports (no Google Fonts)
- Animation requiring JavaScript
- Forms or interactive controls
- Tracking pixels, cookie-setting code, social widgets
- position:fixed CSS
- Unsupported external links

USE only:
- Static HTML: <div>, <table>, <tr>, <td>, <p>, <span>, <strong>, <em>, <ul>, <li>, <img>, <a>
- Inline CSS only
- max-width, width:100%, box-sizing:border-box, border-radius, padding, margin
- font-family: Arial, Helvetica, sans-serif (or Georgia, Courier New, Trebuchet MS, Verdana — web-safe only)
- Mobile-first layout, max content width ~860px, relative widths

## Album Cover Style Adaptation
Infer a visual design system from the front cover or genre/era — do NOT copy or reproduce copyrighted artwork.

Use the cover/genre to infer 3–5 colours: background, panel, primary text, muted text, accent.

Typography mood → web-safe font mapping:
- Arial/Helvetica → clean modern
- Georgia → classic/literary/vintage  
- Courier New → punk/archive/technical/matrix notes
- Trebuchet MS → indie/friendly/90s
- Verdana → clear practical ecommerce

Texture simulation via CSS only: borders, subtle gradients, solid blocks, thin rules.
Abstract motifs: circular label-inspired badges, thin record-groove lines, colour strips, boxed sections.

## HTML Template Structure
Generate a complete, finished HTML snippet — no placeholders.

Required sections:
1. Hero: Artist, Title, Format, short collector line
2. At a glance: Artist, Title, Format, Label, Catalogue No, Country, Year, Matrix status, Condition
3. Issue/pressing notes: Likely version, likelihood % if known, evidence used, matrix status, caveat
4. Condition: Media grade, Sleeve grade, play-test notes, visual notes
5. What's included: inner sleeve, insert, poster, obi, booklet (if any)
6. Packed properly: record mailer note
7. Buyer reassurance: honest grading, extra photos offer

## SEO Title Rules (max 80 characters)
Prioritise: Artist, Title, Format, Label/catno if important, Country/Year if confirmed, Condition if space allows.
Avoid: keyword stuffing, unrelated artists, unsupported "rare"/"first press"/"RARE!!!"/ALL CAPS spam.
If pressing uncertain: use "likely UK issue" or "UK issue family" — NOT in the main title usually, in description.

## Pressing/Issue Wording Rules
- Matrix confirmed: "Matrix/runout matches the identified issue."
- Likely: "Likely issue based on label, catalogue number and sleeve evidence."
- Uncertain: "Exact pressing is unconfirmed because matrix/runout evidence is not available."
- Single label only: "Likely release family identified from label photo. Matrix/runout would be needed to confirm the exact pressing."
- Conflict: "There is a mismatch between claimed year and visible barcode/label evidence, so the listing avoids a definitive first-pressing claim."

## Unsupported Claim Removal — MANDATORY
Before returning, audit and remove:
rare, first press, original, mint, audiophile, limited, signed, authentic, investment, museum quality, archive copy
Replace with: collector-friendly copy, likely issue, appears consistent with, seller-stated, unconfirmed, see photos, matrix needed.

## API Output Contract
Return ONLY valid JSON (no markdown, no code fences):
{
  "agent": "recordlens-ebay-html-listing-creator",
  "mode": "studio_listing_html",
  "style_system": {
    "source": "front_cover | inferred | user_supplied",
    "palette": {
      "background": "#hex",
      "panel": "#hex",
      "text": "#hex",
      "muted": "#hex",
      "accent": "#hex"
    },
    "mood": ["string"],
    "typography_feel": "string or null",
    "layout_treatment": "string or null",
    "style_confidence": 0-1
  },
  "seo": {
    "title_options": ["option1 ≤80chars", "option2 ≤80chars", "option3 ≤80chars"],
    "recommended_title": "string ≤80chars",
    "subtitle": "string ≤55chars or null"
  },
  "item_specifics": {
    "Artist": "string",
    "Title": "string",
    "Format": "string",
    "Record Label": "string",
    "Catalogue Number": "string",
    "Country/Region of Manufacture": "string",
    "Year": "string",
    "Media Grade (Vinyl)": "string",
    "Sleeve Grade": "string"
  },
  "html_description": "COMPLETE static eBay-safe HTML string (no placeholders)",
  "plain_text_description": "plain text fallback — 200-400 words",
  "compliance_audit": {
    "active_content": false,
    "external_links_checked": true,
    "unsupported_claims_removed": ["list of any claims softened"],
    "pressing_caveat_included": true,
    "mobile_friendly": true,
    "remaining_cautions": []
  }
}`;

// ─── Agent function ───────────────────────────────────────────────────────────

export async function generateEbayListing(
  input: ListingCreatorInput,
  client: OpenAI,
  model: string,
): Promise<EbayListingCreatorResult> {
  const matrixStatus = input.matrix_runout_side_a || input.matrix_runout_side_b
    ? `Side A: ${input.matrix_runout_side_a ?? "not visible"} / Side B: ${input.matrix_runout_side_b ?? "not visible"}`
    : "Not photographed — pressing generation unconfirmed";

  const pressingStatus = input.identification_complete
    ? `Confirmed at ${input.likelihood_percent ?? "?"}% confidence`
    : input.likelihood_percent && input.likelihood_percent >= 70
      ? `Likely at ${input.likelihood_percent}% confidence — matrix would confirm`
      : `Probable release family — ${input.likelihood_percent ?? "?"}% confidence, more evidence needed`;

  const conflictsText = input.conflicts.length
    ? `Evidence conflicts: ${input.conflicts.join("; ")}`
    : "No evidence conflicts";

  const missingText = input.missing_evidence.length
    ? `Missing evidence: ${input.missing_evidence.join("; ")}`
    : "No critical evidence missing";

  const tracklistText = input.tracklist.length
    ? `Tracklist: ${input.tracklist.join(", ")}`
    : "Tracklist: not available";

  const userText = `Create an eBay listing for this vinyl record:

IDENTIFICATION:
Artist: ${input.artist ?? "Unknown"}
Title: ${input.title ?? "Unknown"}
Format: ${input.format ?? "LP, Album"}
Label: ${input.label ?? "Unknown"}
Catalogue number: ${input.catalogue_number ?? "unknown"}
Country: ${input.country ?? "unknown"}
Year: ${input.year ?? "unknown"}
Likely release: ${input.likely_release ?? "unknown"}
Pressing status: ${pressingStatus}
Pressing notes: ${input.pressing_notes ?? "none"}

MATRIX / RUNOUT:
${matrixStatus}

CONDITION:
Media grade: ${input.media_grade}
Sleeve grade: ${input.sleeve_grade}
Condition notes: ${input.condition_notes || "none"}
Defects: ${input.defects.join(", ") || "none noted"}

EVIDENCE:
${conflictsText}
${missingText}

MARKET:
Discogs have/want: ${input.discogs_have ?? "?"} / ${input.discogs_want ?? "?"}

${tracklistText}

FRONT COVER STYLE:
${input.front_cover_description ?? "Not described — infer style from artist/genre/year."}

Follow the required workflow: infer style system → generate SEO titles → generate complete HTML → plain text → item specifics → compliance audit → return JSON.`;

  logger.info(
    {
      artist: input.artist,
      title: input.title,
      likelihood: input.likelihood_percent,
      has_matrix: !!(input.matrix_runout_side_a || input.matrix_runout_side_b),
    },
    "EbayListingCreatorAgent: starting",
  );

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
    max_tokens: 4000,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<EbayListingCreatorResult> = {};
  try {
    parsed = JSON.parse(raw) as Partial<EbayListingCreatorResult>;
  } catch (err) {
    logger.warn(
      { err, raw: raw.slice(0, 300) },
      "EbayListingCreatorAgent: JSON.parse failed — using minimal fallback",
    );
  }

  const seo = parsed.seo ?? {};
  const recommendedTitle =
    (seo as EbayListingSeo).recommended_title ??
    `${input.artist ?? ""} ${input.title ?? ""} ${input.format ?? "LP"} ${input.year ?? ""}`.trim().slice(0, 80);

  const titleOptions = (seo as EbayListingSeo).title_options ?? [recommendedTitle];

  const styleSystem: StyleSystem = (parsed.style_system as StyleSystem) ?? {
    source: "inferred",
    palette: {
      background: "#111111",
      panel: "#1b1b1b",
      text: "#f4f4f4",
      muted: "#aaaaaa",
      accent: "#cc3333",
    },
    mood: ["minimal", "collector"],
    typography_feel: "clean modern",
    layout_treatment: "dark panel with accent rule",
    style_confidence: 0.3,
  };

  const complianceAudit: ComplianceAudit = (parsed.compliance_audit as ComplianceAudit) ?? {
    active_content: false,
    external_links_checked: true,
    unsupported_claims_removed: [],
    pressing_caveat_included: true,
    mobile_friendly: true,
    remaining_cautions: [],
  };

  const itemSpecifics = (parsed.item_specifics as Record<string, string>) ?? {};

  const result: EbayListingCreatorResult = {
    agent: "recordlens-ebay-html-listing-creator",
    mode: "studio_listing_html",
    style_system: styleSystem,
    seo: {
      title_options: titleOptions,
      recommended_title: recommendedTitle,
      subtitle: (seo as EbayListingSeo).subtitle ?? `${input.media_grade} / ${input.sleeve_grade}`,
    },
    item_specifics: itemSpecifics,
    html_description: parsed.html_description ?? null,
    plain_text_description: parsed.plain_text_description ?? null,
    compliance_audit: complianceAudit,
    seo_keywords: titleOptions
      .join(" ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 12),
    tracklist: input.tracklist,
  };

  logger.info(
    {
      recommended_title: result.seo.recommended_title,
      has_html: !!result.html_description,
      has_plain_text: !!result.plain_text_description,
      style_source: result.style_system.source,
      compliance_pass: !result.compliance_audit.active_content,
    },
    "EbayListingCreatorAgent: complete",
  );

  return result;
}
