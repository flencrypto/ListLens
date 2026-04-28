import { GuardOutputSchema, type GuardOutput } from "./schemas";

// Phrases that must never appear in Guard AI output (case-insensitive).
const FORBIDDEN_PHRASES = ["fake", "counterfeit", "scammer", "scam", "fraud", "fraudulent"];

// Safe replacements for forbidden phrases.
const SAFE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(fake|counterfeit)\b/gi, "high replica-risk indicators found in"],
  [/\b(scammer|scam)\b/gi, "seller with suspicious listing behaviour"],
  [/\b(fraud(?:ulent)?)\b/gi, "misleading listing"],
];

function sanitiseSafeLanguage(text: string): string {
  return SAFE_REPLACEMENTS.reduce((t, [re, replacement]) => t.replace(re, replacement), text);
}

function containsForbiddenPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some((p) => lower.includes(p));
}

function sanitiseOutput(raw: GuardOutput): GuardOutput {
  for (const flag of raw.red_flags) {
    if (containsForbiddenPhrase(flag.message)) {
      console.warn("[guard] forbidden phrase in red_flag, sanitising:", flag.message);
    }
  }
  for (const q of raw.seller_questions) {
    if (containsForbiddenPhrase(q)) {
      console.warn("[guard] forbidden phrase in seller_question, sanitising:", q);
    }
  }
  return {
    ...raw,
    red_flags: raw.red_flags.map((f) => ({
      ...f,
      message: sanitiseSafeLanguage(f.message),
    })),
    seller_questions: raw.seller_questions.map(sanitiseSafeLanguage),
    // disclaimer is a Zod literal — always the correct value.
    disclaimer: "AI-assisted risk screen, not formal authentication.",
  };
}

const GUARD_SYSTEM_PROMPT = (lens: string) =>
  `You are a specialist ${lens} Guard AI helping buyers evaluate resale listings for risk.

CRITICAL SAFE-LANGUAGE RULES — you MUST follow these without exception:
1. NEVER use the words: "fake", "counterfeit", "scammer", "scam", "fraud", "fraudulent".
2. Instead use phrases such as:
   - "High replica-risk indicators found"
   - "Authenticity cannot be confirmed from the available evidence"
   - "Seller behaviour raises concerns"
   - "Listing lacks expected authenticity evidence"
3. ALWAYS set the "disclaimer" field to exactly: "AI-assisted risk screen, not formal authentication."
4. Return ONLY valid JSON. Do not include any markdown, explanations, or prose outside the JSON object.`;

const MOCK_GUARD_OUTPUT: GuardOutput = {
  mode: "guard",
  lens: "ShoeLens",
  risk: { level: "medium_high", confidence: 0.74 },
  red_flags: [
    { severity: "high", type: "missing_evidence", message: "No inner size label photo is provided." },
    { severity: "medium", type: "price_anomaly", message: "Listed price is 40% below typical market value." },
  ],
  missing_photos: ["Inside size label", "Soles", "Box label"],
  seller_questions: [
    "Could you upload a clear photo of the inside size label?",
    "Please provide photos of both soles.",
  ],
  disclaimer: "AI-assisted risk screen, not formal authentication.",
};

export async function analyseForGuard(
  url?: string,
  screenshotUrls?: string[],
  lens = "ShoeLens"
): Promise<GuardOutput> {
  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const imageMessages = (screenshotUrls ?? []).slice(0, 8).map((u) => ({
      type: "image_url" as const,
      image_url: { url: u, detail: "high" as const },
    }));
    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "high" } }
    > = [
      { type: "text", text: `Analyse this ${lens} listing.${url ? ` URL: ${url}` : ""} Return JSON with mode:"guard", lens, risk, red_flags, missing_photos, seller_questions, disclaimer.` },
      ...imageMessages,
    ];
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: GUARD_SYSTEM_PROMPT(lens) },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const result = GuardOutputSchema.safeParse(raw);
    if (result.success) return sanitiseOutput(result.data);
    console.error("[guard] schema validation failed:", result.error.flatten());
    throw new Error("Guard AI output validation failed");
  }
  return sanitiseOutput({ ...MOCK_GUARD_OUTPUT, lens });
}
