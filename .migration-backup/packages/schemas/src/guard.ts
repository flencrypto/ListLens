import { z } from "zod";
import { LensIdSchema } from "./lenses";

export const GuardOutputSchema = z.object({
  mode: z.literal("guard"),
  lens: LensIdSchema,
  risk: z.object({
    level: z.enum(["low", "medium", "medium_high", "high", "inconclusive"]),
    confidence: z.number().min(0).max(1),
  }),
  red_flags: z.array(z.object({
    severity: z.enum(["low", "medium", "high"]),
    type: z.string(),
    message: z.string(),
  })),
  missing_photos: z.array(z.string()),
  seller_questions: z.array(z.string()),
  disclaimer: z.literal("AI-assisted risk screen, not formal authentication."),
});
export type GuardOutput = z.infer<typeof GuardOutputSchema>;

export const GUARD_EXAMPLE: GuardOutput = {
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
