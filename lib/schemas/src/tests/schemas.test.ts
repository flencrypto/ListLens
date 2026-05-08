import { describe, it, expect } from "vitest";
import { StudioOutputSchema, STUDIO_EXAMPLE } from "../studio.js";
import { GuardOutputSchema, GUARD_EXAMPLE } from "../guard.js";
import { MeasureGarmentSchema, MeasureMotorSchema } from "../measure.js";
import { MotorLensPartIdentificationSchema } from "../motor.js";
import { LayeredIntelligenceOutputSchema, EvidenceScoresSchema } from "../intelligence.js";
import { MarketplaceConnectorCapabilitiesSchema } from "../marketplace.js";

describe("StudioOutputSchema", () => {
  it("validates the example fixture", () => {
    expect(StudioOutputSchema.safeParse(STUDIO_EXAMPLE).success).toBe(true);
  });
  it("rejects missing required fields", () => {
    expect(StudioOutputSchema.safeParse({}).success).toBe(false);
  });
  it("round-trips through JSON serialization", () => {
    const result = StudioOutputSchema.safeParse(JSON.parse(JSON.stringify(STUDIO_EXAMPLE)));
    expect(result.success).toBe(true);
  });
});

describe("GuardOutputSchema", () => {
  it("validates the example fixture", () => {
    expect(GuardOutputSchema.safeParse(GUARD_EXAMPLE).success).toBe(true);
  });
  it("rejects invalid risk level", () => {
    const bad = { ...GUARD_EXAMPLE, risk: { level: "very_high", confidence: 0.9 } };
    expect(GuardOutputSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects wrong disclaimer", () => {
    const bad = { ...GUARD_EXAMPLE, disclaimer: "Wrong disclaimer" };
    expect(GuardOutputSchema.safeParse(bad).success).toBe(false);
  });
  it("round-trips through JSON serialization", () => {
    const result = GuardOutputSchema.safeParse(JSON.parse(JSON.stringify(GUARD_EXAMPLE)));
    expect(result.success).toBe(true);
  });
});

describe("MeasureGarmentSchema", () => {
  it("validates a valid garment measurement", () => {
    const data = {
      mode: "measure_garment",
      sessionId: "ses_123",
      measurements: { chest_cm: 102, waist_cm: 84, hip_cm: 96, shoulder_width_cm: 45, sleeve_length_cm: 63, body_length_cm: 70, inseam_cm: null },
      confidence: 0.87,
      warnings: [],
    };
    expect(MeasureGarmentSchema.safeParse(data).success).toBe(true);
  });
});

describe("MeasureMotorSchema", () => {
  it("validates a valid motor measurement", () => {
    const data = {
      mode: "measure_motor",
      sessionId: "ses_456",
      measurements: { wheelbase_mm: 2600, track_width_mm: 1500, overall_length_mm: 4200, overall_width_mm: 1800 },
      confidence: 0.75,
      warnings: ["Marker partially obscured"],
    };
    expect(MeasureMotorSchema.safeParse(data).success).toBe(true);
  });
});

describe("MotorLensPartIdentificationSchema", () => {
  it("validates a valid part identification", () => {
    const data = {
      mode: "motor_part_identification",
      parts: [{ partName: "Brake Caliper", partNumber: "BC-4521", confidence: 0.9, condition: "good" }],
      vehicleMake: "BMW",
      vehicleModel: "3 Series",
      vehicleYear: 2019,
      warnings: [],
    };
    expect(MotorLensPartIdentificationSchema.safeParse(data).success).toBe(true);
  });
});

describe("LayeredIntelligenceOutputSchema + EvidenceScoresSchema", () => {
  it("validates evidence scores", () => {
    const data = { photoQuality: 0.9, descriptionClarity: 0.7, priceConsistency: 0.85, sellerHistory: null, marketplaceSignals: null };
    expect(EvidenceScoresSchema.safeParse(data).success).toBe(true);
  });
  it("validates layered intelligence output", () => {
    const data = {
      mode: "layered_intelligence",
      lens: "ShoeLens",
      evidenceScores: { photoQuality: 0.9, descriptionClarity: 0.7, priceConsistency: 0.85, sellerHistory: null, marketplaceSignals: null },
      overallConfidence: 0.82,
      recommendation: "Proceed with caution — request additional photos.",
      warnings: [],
    };
    expect(LayeredIntelligenceOutputSchema.safeParse(data).success).toBe(true);
  });
});

describe("MarketplaceConnectorCapabilitiesSchema", () => {
  it("validates ebay capabilities", () => {
    const data = {
      marketplace: "ebay",
      canPublish: true,
      canFetchListing: true,
      canExportCsv: false,
      supportedCategories: ["Footwear", "Clothing"],
      requiredFields: ["title", "price", "condition"],
      optionalFields: ["brand", "model"],
      sandbox: true,
    };
    expect(MarketplaceConnectorCapabilitiesSchema.safeParse(data).success).toBe(true);
  });
});
