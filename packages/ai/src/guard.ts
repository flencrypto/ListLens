import { GuardOutputSchema, type GuardOutput } from "./schemas";

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
        { role: "system", content: `You are a ${lens} Guard AI. Return ONLY valid JSON.` },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const result = GuardOutputSchema.safeParse(raw);
    if (result.success) return result.data;
    throw new Error("Guard AI output validation failed");
  }
  return { ...MOCK_GUARD_OUTPUT, lens };
}
