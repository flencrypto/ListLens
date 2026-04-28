import { z } from "zod";

export const StudioOutputSchema = z.object({
  mode: z.literal("studio"),
  lens: z.string(),
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

export const GuardOutputSchema = z.object({
  mode: z.literal("guard"),
  lens: z.string(),
  risk: z.object({
    level: z.enum(["low", "medium", "medium_high", "high", "inconclusive"]),
    confidence: z.number().min(0).max(1),
  }),
  red_flags: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      type: z.string(),
      message: z.string(),
    })
  ),
  missing_photos: z.array(z.string()),
  seller_questions: z.array(z.string()),
  disclaimer: z.literal("AI-assisted risk screen, not formal authentication."),
});

export type StudioOutput = z.infer<typeof StudioOutputSchema>;
export type GuardOutput = z.infer<typeof GuardOutputSchema>;
