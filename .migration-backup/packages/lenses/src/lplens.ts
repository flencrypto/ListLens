export const LPLENS_CONFIG = {
  name: "LPLens",
  category: "Music Media",
  seller_fields: ["artist","title","format","label","catalogue_number","barcode","country","pressing","matrix_runout","sleeve_grade","media_grade","inserts","genre"],
  buyer_checks: ["missing_matrix","missing_label_closeup","reissue_sold_as_original","bootleg_risk","grading_mismatch"],
  photo_prompts: ["Front sleeve","Back sleeve","Spine","Label side A","Label side B","Barcode / catalogue number","Deadwax / matrix area"],
  required_photos_for_risk_screen: ["Label side A","Label side B","Deadwax / matrix area"],
} as const;
