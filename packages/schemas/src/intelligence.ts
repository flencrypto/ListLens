import { z } from "zod";

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
  lens: z.string(),
  evidenceScores: EvidenceScoresSchema,
  overallConfidence: z.number().min(0).max(1),
  recommendation: z.string(),
  warnings: z.array(z.string()),
});
export type LayeredIntelligenceOutput = z.infer<typeof LayeredIntelligenceOutputSchema>;
