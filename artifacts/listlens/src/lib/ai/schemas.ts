import { z } from "zod";

export const StudioOutputSchema = z.object({
  mode: z.literal("studio"),
  lens: z.string(),
  listing_description: z.string().default(""),
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

/**
 * RecordLens single-label-photo release identification output.
 *
 * Per the product spec the model must return a *ranked* set of likely
 * releases (top match + alternate matches) — never a single overconfident
 * answer — and a flag indicating whether matrix/runout input is needed.
 */
export const DiscogsEnrichmentSchema = z.object({
  release_id: z.number(),
  tracklist: z.array(z.string()).default([]),
  formats: z.array(z.string()).default([]),
  year: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  community_have: z.number().nullable().optional(),
  community_want: z.number().nullable().optional(),
  community_rating: z.number().nullable().optional(),
  lowest_price: z.number().nullable().optional(),
  num_for_sale: z.number().nullable().optional(),
  cover_image: z.string().nullable().optional(),
});

export const RecordReleaseMatchSchema = z.object({
  artist: z.string().nullable(),
  title: z.string().nullable(),
  label: z.string().nullable(),
  catalogue_number: z.string().nullable(),
  likely_release: z.string(),
  likelihood_percent: z.number().min(0).max(100),
  evidence: z.array(z.string()).default([]),
  discogs: DiscogsEnrichmentSchema.optional(),
});

export const RecordReleaseIdentificationSchema = z.object({
  mode: z.literal("recordlens.identify"),
  lens: z.literal("RecordLens"),
  input_type: z.enum(["single_label_photo", "label_and_matrix"]),
  top_match: RecordReleaseMatchSchema,
  alternate_matches: z.array(RecordReleaseMatchSchema),
  needs_matrix_for_clarification: z.boolean(),
  matrix_clarification_questions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  disclaimer: z.literal(
    "AI-assisted release identification — confirm pressing details before listing or buying."
  ),
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
export type RecordReleaseIdentification = z.infer<typeof RecordReleaseIdentificationSchema>;
export type RecordReleaseMatch = z.infer<typeof RecordReleaseMatchSchema>;
export type DiscogsEnrichment = z.infer<typeof DiscogsEnrichmentSchema>;
