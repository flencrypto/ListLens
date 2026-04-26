export const SHOELENS_CONFIG = {
  name: "ShoeLens",
  category: "Footwear",
  seller_fields: ["brand","model","colourway","size_uk","size_eu","size_us","gender","style_code","condition","sole_wear","heel_drag","creasing","stains","has_box","has_laces","accessories"],
  buyer_checks: ["missing_size_label","missing_sole_photo","missing_box_label","style_code_mismatch","suspicious_price"],
  photo_prompts: ["Side profile (both sides)","Toe box (front view)","Heel area","Soles (full outsole)","Inside size label","Box label (if available)","Any visible flaws"],
  required_photos_for_auth: ["Inside size label","Soles","Side profile"],
} as const;
