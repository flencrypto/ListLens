export const SHOELENS_CONFIG = {
  name: "ShoeLens",
  category: "Footwear",
  seller_fields: ["brand","model","colourway","size_uk","size_eu","size_us","gender","style_code","condition","sole_wear","heel_drag","creasing","stains","has_box","has_laces","accessories"],
  buyer_checks: ["missing_size_label","missing_sole_photo","missing_box_label","style_code_mismatch","suspicious_price"],
  photo_prompts: ["Side profile (both sides)","Toe box (front view)","Heel area","Soles (full outsole)","Inside size label","Box label (if available)","Any visible flaws"],
  required_photos_for_risk_screen: ["Inside size label","Soles","Side profile"],
} as const;

export type ShoeLensSellerAttributes = {
  brand: string | null;
  model: string | null;
  colourway: string | null;
  size_uk: string | null;
  size_eu: string | null;
  size_us: string | null;
  gender: string | null;
  style_code: string | null;
  condition: string | null;
  sole_wear: string | null;
  heel_drag: boolean | null;
  creasing: string | null;
  stains: string | null;
  has_box: boolean | null;
  has_laces: boolean | null;
  accessories: string[];
};
