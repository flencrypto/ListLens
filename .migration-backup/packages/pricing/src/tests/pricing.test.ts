import { describe, it, expect } from "vitest";
import { median, percentile, sortAsc } from "../quartiles";
import { derivePricing } from "../heuristics";

describe("sortAsc", () => {
  it("sorts numbers ascending", () => {
    expect(sortAsc([3, 1, 2])).toEqual([1, 2, 3]);
  });
  it("does not mutate the original array", () => {
    const arr = [3, 1, 2];
    sortAsc(arr);
    expect(arr).toEqual([3, 1, 2]);
  });
});

describe("median", () => {
  it("returns 0 for empty array", () => {
    expect(median([])).toBe(0);
  });
  it("returns the single value for a one-element array", () => {
    expect(median([42])).toBe(42);
  });
  it("returns the middle value for an odd-length array", () => {
    expect(median([1, 3, 5])).toBe(3);
  });
  it("returns the average of the two middle values for an even-length array", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("handles unsorted input", () => {
    expect(median([10, 2, 6])).toBe(6);
  });
});

describe("percentile", () => {
  it("returns 0 for empty array", () => {
    expect(percentile([], 50)).toBe(0);
  });
  it("50th percentile equals the median", () => {
    const arr = [10, 20, 30, 40, 50];
    expect(percentile(arr, 50)).toBe(median(arr));
  });
  it("0th percentile equals the minimum", () => {
    expect(percentile([5, 10, 15], 0)).toBe(5);
  });
  it("100th percentile equals the maximum", () => {
    expect(percentile([5, 10, 15], 100)).toBe(15);
  });
  it("interpolates correctly for the 25th percentile", () => {
    // [10, 20, 30, 40] → p25 index = 0.75 → 10*0.25 + 20*0.75 = 17.5
    expect(percentile([10, 20, 30, 40], 25)).toBeCloseTo(17.5);
  });
  it("throws for p < 0", () => {
    expect(() => percentile([1, 2, 3], -1)).toThrow(RangeError);
  });
  it("throws for p > 100", () => {
    expect(() => percentile([1, 2, 3], 101)).toThrow(RangeError);
  });
});

describe("derivePricing", () => {
  it("returns zeroed result for empty comps", () => {
    const result = derivePricing([]);
    expect(result).toEqual({ quickSale: 0, recommended: 0, high: 0, confidence: 0, currency: "GBP" });
  });

  it("quickSale <= recommended <= high", () => {
    const comps = [40, 50, 55, 60, 65, 70, 80, 90, 95, 100];
    const { quickSale, recommended, high } = derivePricing(comps);
    expect(quickSale).toBeLessThanOrEqual(recommended);
    expect(recommended).toBeLessThanOrEqual(high);
  });

  it("uses supplied currency", () => {
    const result = derivePricing([100], "EUR");
    expect(result.currency).toBe("EUR");
  });

  it("confidence is lower for fewer comps", () => {
    const few = derivePricing([10, 20]);
    const many = derivePricing([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(few.confidence).toBeLessThan(many.confidence);
  });

  it("confidence is at most 1.0", () => {
    const result = derivePricing([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]);
    expect(result.confidence).toBeLessThanOrEqual(1.0);
  });

  it("confidence is at least 0.3 for single comp", () => {
    const result = derivePricing([50]);
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
  });
});
