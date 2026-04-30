export const WATCHLENS_CONFIG = {
  name: "WatchLens",
  category: "Watches",
  seller_fields: ["brand","model","reference_number","dial_colour","case_material","bracelet_type","movement_type","year","condition","has_box","has_papers"],
  buyer_checks: ["missing_caseback","missing_crown","serial_number_risk","dial_inconsistency","bracelet_mismatch"],
  photo_prompts: ["Dial (straight-on)","Case side profile","Crown and pushers","Caseback","Bracelet clasp","Box and papers (if available)","Serial/reference on case"],
  required_photos_for_risk_screen: ["Dial","Caseback","Serial/reference"],
} as const;
