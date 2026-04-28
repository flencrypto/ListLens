export const MEASURELENS_CONFIG = {
  name: "MeasureLens",
  category: "Measured Items",
  seller_fields: ["item_type","reference_object","measurement_confidence"],
  buyer_checks: ["marker_not_detected","low_confidence_measurements","perspective_distortion"],
  photo_prompts: ["Flat-lay with reference marker","Front view","Detail shot of labels"],
  required_photos_for_risk_screen: ["Flat-lay with reference marker"],
} as const;
