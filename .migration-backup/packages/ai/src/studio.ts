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
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a specialist ${lens} AI. Return ONLY valid JSON.` },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyse for ${lens}.${hint ? ` Hint: ${hint}` : ""} Return JSON with mode:"studio", lens, identity, attributes, missing_photos, pricing, marketplace_outputs, warnings.` },
            ...imageMessages,
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });
    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const result = StudioOutputSchema.safeParse(raw);
    if (result.success) return result.data;
    throw new Error("AI output validation failed");
  }
  return { ...MOCK_STUDIO_OUTPUT, lens };
}
