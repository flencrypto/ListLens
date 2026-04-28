import { z } from "zod";
import { LensIdSchema } from "./lenses";

export const StudioOutputSchema = z.object({
  mode: z.literal("studio"),
  lens: LensIdSchema,
  identity: z.object({
    brand: z.string().nullable(),
    model: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  attributes: z.record(z.unknown()),
  missing_photos: z.array(z.string()),
  pricing: z.object({
    quick_sale: z.number(),
    recommended: z.number(),
    high: z.number(),
    currency: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  marketplace_outputs: z.object({
    ebay: z.record(z.unknown()),
    vinted: z.record(z.unknown()),
  }),
  warnings: z.array(z.string()),
});
export type StudioOutput = z.infer<typeof StudioOutputSchema>;

export const STUDIO_EXAMPLE: StudioOutput = {
  mode: "studio",
  lens: "ShoeLens",
  identity: { brand: "Nike", model: "Air Max 90", confidence: 0.82 },
  attributes: {
    size_uk: null, size_eu: null, size_us: null,
    gender: "Men's", colourway: "White/Black", condition: "Used - Good",
    visible_flaws: ["Minor creasing on toe box", "Light sole wear"],
    style_code: "CN8490-100", has_box: false, has_laces: true,
  },
  missing_photos: ["Inside size label", "Sole photo", "Box label"],
  pricing: { quick_sale: 45, recommended: 60, high: 75, currency: "GBP", confidence: 0.72 },
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
