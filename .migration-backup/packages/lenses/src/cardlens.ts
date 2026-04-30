export const CARDLENS_CONFIG = {
  name: "CardLens",
  category: "Trading Cards",
  seller_fields: ["card_name","set","year","condition","grade","grading_company","foil","holographic","language"],
  buyer_checks: ["missing_surface_photos","grading_inconsistency","reprint_risk","trimmed_edges"],
  photo_prompts: ["Card front","Card back","Card edges (all 4)","Grading label (if graded)","Surface under light"],
  required_photos_for_risk_screen: ["Card front","Card back","Card edges"],
} as const;
