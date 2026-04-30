export const TOYLENS_CONFIG = {
  name: "ToyLens",
  category: "Toys & Games",
  seller_fields: ["brand","product_name","set","year","condition","completeness","box_present","age_range"],
  buyer_checks: ["missing_pieces","box_condition_mismatch","replica_risk","age_rating_compliance"],
  photo_prompts: ["Product front","Product back","Contents (pieces laid out)","Box (if present)","Any visible damage","Batch/copyright mark"],
  required_photos_for_risk_screen: ["Product front","Contents","Batch/copyright mark"],
} as const;
