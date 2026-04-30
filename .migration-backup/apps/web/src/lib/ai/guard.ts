import { GuardOutputSchema, type GuardOutput } from "./schemas";

// Phrases that must never appear in AI output (case-insensitive)
const FORBIDDEN_PHRASES = ["fake", "counterfeit", "scammer", "scam", "fraud", "fraudulent"];

// Safe replacements for forbidden phrases
const SAFE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(fake|counterfeit)\b/gi, "high replica-risk indicators found in"],
  [/\b(scammer|scam)\b/gi, "seller with suspicious listing behaviour"],
  [/\b(fraud(?:ulent)?)\b/gi, "misleading listing"],
];

function sanitiseSafeLanguage(text: string): string {
  return SAFE_REPLACEMENTS.reduce((t, [re, replacement]) => t.replace(re, replacement), text);
}

function sanitiseOutput(raw: GuardOutput): GuardOutput {
  return {
    ...raw,
    red_flags: raw.red_flags.map((f) => ({
      ...f,
      message: sanitiseSafeLanguage(f.message),
    })),
    seller_questions: raw.seller_questions.map(sanitiseSafeLanguage),
    // disclaimer is a Zod literal — always the correct value
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
    const imageMessages = (screenshotUrls ?? []).slice(0, 6).map((u) => ({
      type: "image_url" as const,
      image_url: { url: u, detail: "high" as const },
    }));
    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "high" } }
    > = [
      {
        type: "text",
        text: `Analyse this ${lens} listing for buyer risk.${url ? ` URL: ${url}` : ""}
Return a JSON object with these fields:
{
  "mode": "guard",
  "lens": "${lens}",
  "risk": { "level": "low"|"medium"|"medium_high"|"high"|"inconclusive", "confidence": 0-1 },
  "red_flags": [{ "severity": "low"|"medium"|"high", "type": string, "message": string }],
  "missing_photos": [string],
  "seller_questions": [string],
  "disclaimer": "AI-assisted risk screen, not formal authentication."
}`,
      },
      ...imageMessages,
    ];

    const messages: Parameters<typeof client.chat.completions.create>[0]["messages"] = [
      { role: "system", content: GUARD_SYSTEM_PROMPT(lens) },
      { role: "user", content: userContent },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const result = GuardOutputSchema.safeParse(raw);

    if (result.success) {
      const sanitised = sanitiseOutput(result.data);
      // Log compliance warning if the model emitted forbidden phrases (before sanitisation)
      const rawText = JSON.stringify(result.data).toLowerCase();
      const violations = FORBIDDEN_PHRASES.filter((p) => rawText.includes(p));
      if (violations.length > 0) {
        console.warn("Guard AI emitted forbidden phrase(s) — sanitised:", violations);
      }
      return sanitised;
    }

    // Retry once with a repair prompt
    const repairMessages: typeof messages = [
      ...messages,
      { role: "assistant", content: response.choices[0].message.content ?? "" },
      {
        role: "user",
        content: `Your response did not match the required schema. Validation errors:\n${JSON.stringify(result.error.errors)}\n\nPlease return a corrected JSON object that matches the schema exactly. Remember: disclaimer MUST be "AI-assisted risk screen, not formal authentication."`,
      },
    ];
    const repairResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: repairMessages,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    const repairRaw = JSON.parse(repairResponse.choices[0].message.content ?? "{}");
    const repairResult = GuardOutputSchema.safeParse(repairRaw);
    if (repairResult.success) return sanitiseOutput(repairResult.data);

    console.error("Guard AI output validation failed after retry:", repairResult.error.errors);
    throw new Error("Guard AI output validation failed");
  }

  // Pre-check: if any forbidden phrase slips into mock, sanitise it
  const hasForbidden = FORBIDDEN_PHRASES.some((p) =>
    JSON.stringify(MOCK_GUARD_OUTPUT).toLowerCase().includes(p)
  );
  if (hasForbidden) return sanitiseOutput({ ...MOCK_GUARD_OUTPUT, lens });
  return { ...MOCK_GUARD_OUTPUT, lens };
}
