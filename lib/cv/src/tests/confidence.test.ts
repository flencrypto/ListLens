import { describe, it, expect } from "vitest";
import { combineConfidences, penaliseForWarnings, confidenceLabel } from "../confidence.js";

describe("combineConfidences", () => {
  it("returns 0 for empty array", () => {
    expect(combineConfidences([])).toBe(0);
  });

  it("returns the single value for one score", () => {
    expect(combineConfidences([0.8])).toBeCloseTo(0.8);
  });

  it("geometric mean of equal scores equals the score", () => {
    expect(combineConfidences([0.6, 0.6, 0.6])).toBeCloseTo(0.6);
  });

  it("a zero score collapses overall to near zero", () => {
    expect(combineConfidences([1.0, 0.9, 0.0])).toBeCloseTo(0);
  });

  it("respects weights (higher weight = more influence)", () => {
    const unweighted = combineConfidences([0.9, 0.1]);
    const weighted = combineConfidences([0.9, 0.1], [3, 1]);
    expect(weighted).toBeGreaterThan(unweighted);
  });

  it("throws if weights length does not match scores", () => {
    expect(() => combineConfidences([0.5, 0.6], [1])).toThrow();
  });

  it("clamps scores to [0, 1]", () => {
    expect(combineConfidences([1.5])).toBeCloseTo(1);
    expect(combineConfidences([-0.5])).toBeCloseTo(0);
  });
});

describe("penaliseForWarnings", () => {
  it("no warnings = no penalty", () => {
    expect(penaliseForWarnings(0.8, 0)).toBeCloseTo(0.8);
  });

  it("each warning deducts 0.1", () => {
    expect(penaliseForWarnings(0.8, 2)).toBeCloseTo(0.6);
  });

  it("caps penalty at 0.5", () => {
    expect(penaliseForWarnings(0.8, 10)).toBeCloseTo(0.3);
  });

  it("never returns negative", () => {
    expect(penaliseForWarnings(0.2, 10)).toBeGreaterThanOrEqual(0);
  });
});

describe("confidenceLabel", () => {
  it("returns high for 0.8+", () => {
    expect(confidenceLabel(0.9)).toBe("high");
    expect(confidenceLabel(0.8)).toBe("high");
  });
  it("returns medium for 0.5–0.79", () => {
    expect(confidenceLabel(0.7)).toBe("medium");
    expect(confidenceLabel(0.5)).toBe("medium");
  });
  it("returns low below 0.5", () => {
    expect(confidenceLabel(0.3)).toBe("low");
    expect(confidenceLabel(0)).toBe("low");
  });
});
