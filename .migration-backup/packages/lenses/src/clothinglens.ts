export const CLOTHINGLENS_CONFIG = {
  name: "ClothingLens",
  category: "Clothing",
  seller_fields: ["brand","garment_type","size","colour","material","condition","labels_present","measurements_provided"],
  buyer_checks: ["missing_size_label","missing_measurements","grading_inconsistency","replica_risk"],
  photo_prompts: ["Front (full garment)","Back (full garment)","Care label","Brand/size label","Any visible flaws","Measurements photo (flat-lay with ruler)"],
  required_photos_for_risk_screen: ["Brand/size label","Front","Care label"],
} as const;
