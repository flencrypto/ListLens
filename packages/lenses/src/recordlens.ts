/**
 * RecordLens — the specialist Lens for vinyl, CDs, cassettes and other music
 * media. RecordLens is the canonical name from the product spec; the original
 * `LPLens` name is kept as a back-compat alias (see `index.ts`).
 *
 * RecordLens supports two distinct flows beyond the standard Studio path:
 *
 *  1. Single-label-photo release identification — rank possible releases by
 *     percentage likelihood from one clear photo of the record label.
 *  2. Matrix/runout clarification flow — when label-only confidence is low or
 *     multiple pressings share the same label, ask the seller for runout
 *     etchings and re-rank.
 *
 * Trust rule: never claim "first pressing", "original", "rare", "mint" or
 * "authentic" without supporting evidence. Always return ranked likelihoods.
 */
export const RECORDLENS_CONFIG = {
  name: "RecordLens",
  category: "Music Media",
  seller_fields: [
    "artist",
    "title",
    "format",
    "label",
    "catalogue_number",
    "barcode",
    "country",
    "pressing_clues",
    "label_variant",
    "matrix_runout",
    "sleeve_grade",
    "media_grade",
    "inserts",
    "obi_or_posters_or_booklets",
    "genre",
    "release_notes",
    "price_range",
  ],
  buyer_checks: [
    "missing_matrix",
    "missing_label_closeup",
    "reissue_sold_as_original",
    "bootleg_risk",
    "grading_mismatch",
    "missing_obi_or_inserts",
  ],
  photo_prompts: [
    "Front sleeve",
    "Back sleeve",
    "Spine",
    "Label side A",
    "Label side B",
    "Barcode / catalogue number",
    "Deadwax / matrix area (side A)",
    "Deadwax / matrix area (side B)",
  ],
  required_photos_for_risk_screen: [
    "Label side A",
    "Label side B",
    "Deadwax / matrix area (side A)",
  ],
  /** Signals examined during single-label-photo release identification. */
  label_identification_signals: [
    "label_name_and_logo",
    "catalogue_number",
    "side_indicator",
    "rights_society",
    "speed_marking",
    "stereo_or_mono_marking",
    "publishing_credits",
    "track_layout",
    "typography",
    "label_colour",
    "rim_text",
    "manufacturing_country",
    "known_label_design_variants",
  ],
} as const;
