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

const RiskDimensionSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.string(),
});

export const GuardOutputSchema = z.object({
  mode: z.literal("guard"),
  lens: z.string(),
  risk: z.object({
    level: z.enum(["low", "medium", "medium_high", "high", "inconclusive"]),
    confidence: z.number().min(0).max(1),
    summary: z.string(),
  }),
  risk_dimensions: z.object({
    price: RiskDimensionSchema,
    photos: RiskDimensionSchema,
    listing_quality: RiskDimensionSchema,
    item_authenticity: RiskDimensionSchema,
    seller_signals: RiskDimensionSchema,
  }),
  red_flags: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      type: z.string(),
      message: z.string(),
    })
  ),
  green_signals: z.array(
    z.object({
      type: z.string(),
      message: z.string(),
    })
  ),
  price_analysis: z.object({
    asking_price: z.string().nullable(),
    market_estimate: z.string().nullable(),
    price_verdict: z.enum(["fair", "low_risk_deal", "suspiciously_low", "overpriced", "unknown"]),
    price_note: z.string(),
  }),
  authenticity_signals: z.array(
    z.object({
      marker: z.string(),
      observed: z.string(),
      verdict: z.enum(["pass", "fail", "unclear"]),
    })
  ),
  missing_photos: z.array(z.string()),
  seller_questions: z.array(z.string()),
  buy_recommendation: z.object({
    verdict: z.enum(["proceed", "proceed_with_caution", "ask_questions_first", "avoid"]),
    reasoning: z.string(),
  }),
  disclaimer: z.literal("AI-assisted risk screen, not formal authentication."),
});

export type StudioOutput = z.infer<typeof StudioOutputSchema>;
export type GuardOutput = z.infer<typeof GuardOutputSchema>;
export type GuardRiskDimension = z.infer<typeof RiskDimensionSchema>;
export type RecordReleaseIdentification = z.infer<typeof RecordReleaseIdentificationSchema>;
export type RecordReleaseMatch = z.infer<typeof RecordReleaseMatchSchema>;
export type DiscogsEnrichment = z.infer<typeof DiscogsEnrichmentSchema>;

export const TechLensAttributesSchema = z.object({
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  storage_or_spec: z.string().nullable().optional(),
  model_number: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  screen_damage: z.string().nullable().optional(),
  body_damage: z.string().nullable().optional(),
  ports_condition: z.string().nullable().optional(),
  battery_health: z.string().nullable().optional(),
  included_accessories: z.array(z.string()).optional(),
  tested_or_untested: z.enum(["tested", "untested", "unknown"]).nullable().optional(),
  fault_notes: z.string().nullable().optional(),
  activation_lock_status: z.string().nullable().optional(),
  network_lock_status: z.string().nullable().optional(),
}).passthrough();

export const BookLensAttributesSchema = z.object({
  title: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  edition: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  dust_jacket_present: z.boolean().nullable().optional(),
  dust_jacket_condition: z.string().nullable().optional(),
  printing_statement: z.string().nullable().optional(),
  spine_condition: z.string().nullable().optional(),
  boards_condition: z.string().nullable().optional(),
  pages_condition: z.string().nullable().optional(),
  foxing: z.string().nullable().optional(),
  annotations: z.string().nullable().optional(),
  signatures: z.string().nullable().optional(),
  completeness: z.string().nullable().optional(),
}).passthrough();

export const AntiquesLensAttributesSchema = z.object({
  object_type: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  era_or_style: z.string().nullable().optional(),
  maker_marks: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  chips_or_cracks_or_repairs: z.string().nullable().optional(),
  patina: z.string().nullable().optional(),
  missing_parts: z.string().nullable().optional(),
  provenance: z.string().nullable().optional(),
  estimated_price_range: z.string().nullable().optional(),
}).passthrough();

export const AutographLensAttributesSchema = z.object({
  signed_item_type: z.string().nullable().optional(),
  claimed_signer: z.string().nullable().optional(),
  signature_location: z.string().nullable().optional(),
  ink_visibility: z.string().nullable().optional(),
  certificate_or_provenance_present: z.boolean().nullable().optional(),
  coa_issuer: z.string().nullable().optional(),
  event_or_source_notes: z.string().nullable().optional(),
  item_condition: z.string().nullable().optional(),
}).passthrough();

export const LENS_ATTRIBUTE_SCHEMAS: Partial<Record<string, z.ZodTypeAny>> = {
  TechLens: TechLensAttributesSchema,
  BookLens: BookLensAttributesSchema,
  AntiquesLens: AntiquesLensAttributesSchema,
  AutographLens: AutographLensAttributesSchema,
};

export type TechLensAttributes = z.infer<typeof TechLensAttributesSchema>;
export type BookLensAttributes = z.infer<typeof BookLensAttributesSchema>;
export type AntiquesLensAttributes = z.infer<typeof AntiquesLensAttributesSchema>;
export type AutographLensAttributes = z.infer<typeof AutographLensAttributesSchema>;
