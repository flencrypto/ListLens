import {
  RecordReleaseIdentificationSchema,
  type RecordReleaseIdentification,
} from "./schemas";

/**
 * RecordLens — release / version identification from a single record-label
 * photo, with an optional follow-up step that incorporates matrix/runout
 * information for sharper pressing identification.
 *
 * Two key product rules are enforced here:
 *
 *  - Output is a *ranked* list (top + alternates) with percentage likelihoods,
 *    never a single overconfident answer.
 *  - The trust language ("Likely version: …, X% confidence") is enforced via
 *    Zod schema literals and a sanitiser that strips overconfident phrases
 *    such as "first pressing" or "original" when no matrix has been provided.
 */

const DISCLAIMER =
  "AI-assisted release identification — confirm pressing details before listing or buying." as const;

/** Phrases that imply unsupported certainty about pressing/originality or collectible status. */
const OVERCONFIDENT_PHRASES: Array<[RegExp, string]> = [
  [/\bfirst pressing\b/gi, "early pressing family (unconfirmed)"],
  [/\boriginal pressing\b/gi, "early pressing family (unconfirmed)"],
  [/\b(definitely|certainly|guaranteed)\b/gi, "likely"],
  [/\bauthentic signed\b/gi, "claimed signed"],
  [/\bauthentic\b/gi, "claimed authentic"],
  [/\boriginal\b/gi, "earlier-era"],
  [/\brare\b/gi, "hard-to-find"],
  [/\bmint\b/gi, "appears clean (grading not verified)"],
];

function softenLanguage(text: string): string {
  return OVERCONFIDENT_PHRASES.reduce((t, [re, replacement]) => t.replace(re, replacement), text);
}

function softenMatch<T extends { likely_release: string; evidence: string[] }>(m: T): T {
  return {
    ...m,
    likely_release: softenLanguage(m.likely_release),
    evidence: m.evidence.map(softenLanguage),
  };
}

function sanitise(raw: RecordReleaseIdentification): RecordReleaseIdentification {
  return {
    ...raw,
    top_match: softenMatch(raw.top_match),
    alternate_matches: raw.alternate_matches.map(softenMatch),
    warnings: raw.warnings.map(softenLanguage),
    disclaimer: DISCLAIMER,
  };
}

const MOCK_LABEL_ONLY: RecordReleaseIdentification = {
  mode: "recordlens.identify",
  lens: "RecordLens",
  input_type: "single_label_photo",
  top_match: {
    artist: "Radiohead",
    title: "OK Computer",
    label: "Parlophone",
    catalogue_number: "NODATA 02",
    likely_release: "UK 1997 double LP pressing family",
    likelihood_percent: 72,
    evidence: ["Parlophone label design", "Catalogue number visible", "UK rim text"],
  },
  alternate_matches: [
    {
      artist: "Radiohead",
      title: "OK Computer",
      label: "Parlophone",
      catalogue_number: null,
      likely_release: "Later UK/EU reissue",
      likelihood_percent: 18,
      evidence: ["Newer label print quality"],
    },
    {
      artist: null,
      title: null,
      label: null,
      catalogue_number: null,
      likely_release: "Unclear variant — needs matrix runout",
      likelihood_percent: 10,
      evidence: ["Multiple known label-design variants share this catalogue"],
    },
  ],
  needs_matrix_for_clarification: true,
  matrix_clarification_questions: [
    "Could you photograph the deadwax / matrix runout on side A?",
    "Could you photograph the deadwax / matrix runout on side B?",
    "Are there any extra symbols or initials etched into the runout?",
  ],
  warnings: [
    "Pressing variant cannot be confirmed from the label photo alone.",
    "Do not list as first pressing or original until matrix runout confirms it.",
  ],
  disclaimer: DISCLAIMER,
};

const MOCK_LABEL_AND_MATRIX: RecordReleaseIdentification = {
  ...MOCK_LABEL_ONLY,
  input_type: "label_and_matrix",
  top_match: {
    ...MOCK_LABEL_ONLY.top_match,
    likely_release: "UK 1997 first-issue pressing family (matrix supports A1/B1)",
    likelihood_percent: 88,
    evidence: [
      ...MOCK_LABEL_ONLY.top_match.evidence,
      "Matrix runout consistent with early UK pressing",
    ],
  },
  alternate_matches: [
    {
      artist: "Radiohead",
      title: "OK Computer",
      label: "Parlophone",
      catalogue_number: null,
      likely_release: "Later UK/EU reissue",
      likelihood_percent: 9,
      evidence: ["Less common matrix variant"],
    },
    {
      artist: null,
      title: null,
      label: null,
      catalogue_number: null,
      likely_release: "Other regional variant",
      likelihood_percent: 3,
      evidence: ["Catalogue suffix uncertain"],
    },
  ],
  needs_matrix_for_clarification: false,
  matrix_clarification_questions: [],
  warnings: [
    "Pressing family identified — confirm with seller before describing as first pressing in a public listing.",
  ],
};

const SYSTEM_PROMPT = `You are RecordLens, a specialist AI for identifying vinyl, CD and cassette releases for a resale platform.

CRITICAL RULES — follow without exception:
1. Return ONLY valid JSON. No markdown, no prose outside the JSON object.
2. Provide a RANKED list (top_match + alternate_matches) with percentage likelihoods that sum to roughly 100. Never give a single overconfident answer.
3. NEVER claim "first pressing", "original pressing", "rare", "mint" or "authentic signed copy" unless evidence in the photos clearly supports it. Prefer phrasing like "early pressing family", "likely UK 1997 issue family".
4. Set "needs_matrix_for_clarification" to true whenever multiple known pressings share the same label/catalogue, OR top-match likelihood is below 80%.
5. Always set "disclaimer" to exactly: "AI-assisted release identification — confirm pressing details before listing or buying."
6. Use the signals: label name and logo, catalogue number, side indicator, rights society, speed marking, stereo/mono marking, publishing credits, track layout, typography, label colour, rim text, manufacturing country and known label-design variants.`;

function userPromptForLabel(hint?: string): string {
  return `Identify the likely record release(s) from this label photograph.${hint ? ` Seller hint: ${hint}` : ""}

Return JSON exactly matching:
{
  "mode": "recordlens.identify",
  "lens": "RecordLens",
  "input_type": "single_label_photo",
  "top_match": { "artist": string|null, "title": string|null, "label": string|null, "catalogue_number": string|null, "likely_release": string, "likelihood_percent": 0-100, "evidence": [string] },
  "alternate_matches": [ /* 1-4 alternate matches in the same shape, descending likelihood */ ],
  "needs_matrix_for_clarification": boolean,
  "matrix_clarification_questions": [string],
  "warnings": [string],
  "disclaimer": "AI-assisted release identification — confirm pressing details before listing or buying."
}`;
}

function userPromptForMatrix(matrix: MatrixInput, hint?: string): string {
  return `Re-rank likely record releases now that the seller has provided matrix / runout details.${hint ? ` Seller hint: ${hint}` : ""}

Matrix runout side A: ${matrix.side_a ?? "(not provided)"}
Matrix runout side B: ${matrix.side_b ?? "(not provided)"}
Matrix runout side C: ${matrix.side_c ?? "(not provided)"}
Matrix runout side D: ${matrix.side_d ?? "(not provided)"}
Etched/stamped notes: ${matrix.etched_notes ?? "(none)"}
Extra symbols / initials: ${matrix.extra_symbols ?? "(none)"}

Return JSON in the same shape as before but with "input_type": "label_and_matrix". Set "needs_matrix_for_clarification" to false unless the matrix data is still ambiguous.`;
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  imageUrls: string[]
): Promise<RecordReleaseIdentification> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const imageMessages = imageUrls.slice(0, 6).map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const },
  }));
  const messages: Parameters<typeof client.chat.completions.create>[0]["messages"] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text" as const, text: userPrompt },
        ...imageMessages,
      ],
    },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });
  const raw = JSON.parse(response.choices[0].message.content ?? "{}");
  const parsed = RecordReleaseIdentificationSchema.safeParse(raw);
  if (parsed.success) return sanitise(parsed.data);

  // One repair attempt
  const repairMessages: typeof messages = [
    ...messages,
    { role: "assistant", content: response.choices[0].message.content ?? "" },
    {
      role: "user",
      content: `Your response did not match the required schema. Validation errors:\n${JSON.stringify(
        parsed.error.errors
      )}\n\nReturn a corrected JSON object that matches the schema exactly. Remember disclaimer must be exactly: "AI-assisted release identification — confirm pressing details before listing or buying."`,
    },
  ];
  const repair = await client.chat.completions.create({
    model: "gpt-4o",
    messages: repairMessages,
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });
  const repairRaw = JSON.parse(repair.choices[0].message.content ?? "{}");
  const repairParsed = RecordReleaseIdentificationSchema.safeParse(repairRaw);
  if (repairParsed.success) return sanitise(repairParsed.data);
  console.error("RecordLens identify validation failed after retry:", repairParsed.error.errors);
  throw new Error("RecordLens output validation failed");
}

/**
 * Identify likely record release(s) from one or more label photos.
 *
 * Returns ranked likelihoods. Sets `needs_matrix_for_clarification` whenever
 * multiple plausible variants share the visible catalogue number/label.
 */
export async function analyseRecordLabel(
  labelPhotoUrls: string[],
  hint?: string
): Promise<RecordReleaseIdentification> {
  if (process.env.OPENAI_API_KEY) {
    return callOpenAI(SYSTEM_PROMPT, userPromptForLabel(hint), labelPhotoUrls);
  }
  return sanitise(MOCK_LABEL_ONLY);
}

export interface MatrixInput {
  side_a?: string;
  side_b?: string;
  side_c?: string;
  side_d?: string;
  etched_notes?: string;
  extra_symbols?: string;
}

/**
 * Re-rank record release likelihoods using matrix/runout details supplied by
 * the seller (or extracted from a deadwax photo).
 */
export async function analyseRecordWithMatrix(
  labelPhotoUrls: string[],
  matrix: MatrixInput,
  hint?: string
): Promise<RecordReleaseIdentification> {
  if (process.env.OPENAI_API_KEY) {
    return callOpenAI(SYSTEM_PROMPT, userPromptForMatrix(matrix, hint), labelPhotoUrls);
  }
  return sanitise(MOCK_LABEL_AND_MATRIX);
}
