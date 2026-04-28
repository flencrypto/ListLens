import { StudioOutputSchema, type StudioOutput } from "./schemas";

const MOCK_STUDIO_OUTPUT: StudioOutput = {
  mode: "studio",
  lens: "ShoeLens",
  identity: { brand: "Nike", model: "Air Max 90", confidence: 0.82 },
  attributes: {
    size_uk: null,
    size_eu: null,
    size_us: null,
    gender: "Men's",
    colourway: "White/Black",
    condition: "Used - Good",
    visible_flaws: ["Minor creasing on toe box", "Light sole wear"],
    style_code: "CN8490-100",
    has_box: false,
    has_laces: true,
  },
  missing_photos: ["Inside size label", "Sole photo", "Box label"],
  pricing: {
    quick_sale: 45,
    recommended: 60,
    high: 75,
    currency: "GBP",
    confidence: 0.72,
  },
  marketplace_outputs: {
    ebay: {
      title: "Nike Air Max 90 White/Black CN8490-100 UK Size Unknown Used",
      description: "Nike Air Max 90 in White/Black colourway.",
      item_specifics: { Brand: "Nike", Model: "Air Max 90" },
      category_id: "15709",
      condition_id: "3000",
    },
    vinted: {
      title: "Nike Air Max 90 White/Black Used Good Condition",
      description: "Nike Air Max 90 in White/Black.",
      price_suggestion: 60,
      category_id: "1",
    },
  },
  warnings: ["Size not visible in photos", "Authenticity not independently verified"],
};

const STUDIO_SYSTEM_PROMPT = (lens: string) =>
  `You are a specialist ${lens} AI for a resale listing platform. Return ONLY valid JSON. Do not include any markdown, explanations, or prose outside the JSON object.`;

export async function analyseForStudio(
  photoUrls: string[],
  hint?: string,
  lens = "ShoeLens"
): Promise<StudioOutput> {
  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const imageMessages = photoUrls.slice(0, 8).map((url) => ({
      type: "image_url" as const,
      image_url: { url, detail: "high" as const },
    }));

    const userPrompt = `Analyse these item photos for a ${lens} listing.${hint ? ` Seller hint: ${hint}` : ""}
Return a JSON object with these fields:
{
  "mode": "studio",
  "lens": "${lens}",
  "identity": { "brand": string|null, "model": string|null, "confidence": 0-1 },
  "attributes": { /* lens-specific key-value pairs */ },
  "missing_photos": [string],
  "pricing": { "quick_sale": number, "recommended": number, "high": number, "currency": "GBP", "confidence": 0-1 },
  "marketplace_outputs": {
    "ebay": { "title": string, "description": string, "item_specifics": object, "category_id": string, "condition_id": string },
    "vinted": { "title": string, "description": string, "price_suggestion": number, "category_id": string }
  },
  "warnings": [string]
}`;

    const messages: Parameters<typeof client.chat.completions.create>[0]["messages"] = [
      { role: "system", content: STUDIO_SYSTEM_PROMPT(lens) },
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
      max_tokens: 2000,
    });

    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const result = StudioOutputSchema.safeParse(raw);
    if (result.success) return result.data;

    // Retry once with a repair prompt
    const repairMessages: typeof messages = [
      ...messages,
      { role: "assistant", content: response.choices[0].message.content ?? "" },
      {
        role: "user",
        content: `Your response did not match the required schema. Validation errors:\n${JSON.stringify(result.error.errors)}\n\nPlease return a corrected JSON object that matches the schema exactly.`,
      },
    ];
    const repairResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: repairMessages,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });
    const repairRaw = JSON.parse(repairResponse.choices[0].message.content ?? "{}");
    const repairResult = StudioOutputSchema.safeParse(repairRaw);
    if (repairResult.success) return repairResult.data;

    console.error("Studio AI output validation failed after retry:", repairResult.error.errors);
    throw new Error("AI output validation failed");
  }
  return { ...MOCK_STUDIO_OUTPUT, lens };
}
