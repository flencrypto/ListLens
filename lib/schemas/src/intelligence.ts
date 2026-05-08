import { z } from "zod";
import { LensIdSchema } from "./lenses.js";

export const EvidenceScoresSchema = z.object({
  photoQuality: z.number().min(0).max(1),
  descriptionClarity: z.number().min(0).max(1),
  priceConsistency: z.number().min(0).max(1),
  sellerHistory: z.number().min(0).max(1).nullable(),
  marketplaceSignals: z.number().min(0).max(1).nullable(),
});
export type EvidenceScores = z.infer<typeof EvidenceScoresSchema>;

export const LayeredIntelligenceOutputSchema = z.object({
  mode: z.literal("layered_intelligence"),
  lens: LensIdSchema,
  evidenceScores: EvidenceScoresSchema,
  overallConfidence: z.number().min(0).max(1),
  recommendation: z.string(),
  warnings: z.array(z.string()),
});
export type LayeredIntelligenceOutput = z.infer<typeof LayeredIntelligenceOutputSchema>;
