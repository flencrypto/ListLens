export const MOTORLENS_CONFIG = {
  name: "MotorLens",
  category: "Vehicles & Parts",
  seller_fields: ["make","model","year","mileage","registration","vin","condition","part_type","oem_number"],
  buyer_checks: ["vin_mismatch","mileage_inconsistency","part_number_risk","condition_mismatch","provenance_missing"],
  photo_prompts: ["VIN plate","Odometer","Engine bay","Exterior (all 4 sides)","Interior","Any visible damage","Part number label (for parts)"],
  required_photos_for_risk_screen: ["VIN plate","Odometer"],
} as const;
