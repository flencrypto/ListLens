import { describe, it, expect } from "vitest";
import {
  sanitiseSafeLanguage,
  findDisallowedPhrase,
  assertSafeLanguage,
  DISALLOWED_PHRASES,
  ALLOWED_PHRASES,
} from "../safeWording.js";

describe("findDisallowedPhrase", () => {
  it("returns undefined for clean text", () => {
    expect(findDisallowedPhrase("High replica-risk indicators found in the listing")).toBeUndefined();
  });

  it("detects 'fake' in text", () => {
    expect(findDisallowedPhrase("This item is fake.")).toBeDefined();
  });

  it("detects 'counterfeit' case-insensitively", () => {
    expect(findDisallowedPhrase("COUNTERFEIT item")).toBeDefined();
  });

  it("detects 'scammer'", () => {
    expect(findDisallowedPhrase("The seller is a scammer")).toBeDefined();
  });

  it("detects 'fraud'", () => {
    expect(findDisallowedPhrase("This is fraud")).toBeDefined();
  });

  it("detects all DISALLOWED_PHRASES", () => {
    for (const phrase of DISALLOWED_PHRASES) {
      expect(findDisallowedPhrase(phrase), `expected to detect: "${phrase}"`).toBeDefined();
    }
  });
});

describe("sanitiseSafeLanguage", () => {
  it("replaces 'fake' with safe alternative", () => {
    const result = sanitiseSafeLanguage("This is fake.");
    expect(result.toLowerCase()).not.toContain("fake");
  });

  it("replaces 'counterfeit' with safe alternative", () => {
    const result = sanitiseSafeLanguage("Possibly counterfeit item.");
    expect(result.toLowerCase()).not.toContain("counterfeit");
  });

  it("replaces 'scam' with safe alternative", () => {
    const result = sanitiseSafeLanguage("This looks like a scam.");
    expect(result.toLowerCase()).not.toContain("scam");
  });

  it("does not alter already-safe text", () => {
    const safe = "High replica-risk indicators found in the listing.";
    expect(sanitiseSafeLanguage(safe)).toBe(safe);
  });
});

describe("assertSafeLanguage", () => {
  it("does not throw for safe text", () => {
    expect(() => assertSafeLanguage("Authenticity cannot be confirmed from the available evidence.")).not.toThrow();
  });

  it("throws for text containing 'fake'", () => {
    expect(() => assertSafeLanguage("This is fake.")).toThrow();
  });

  it("throws for 'Definitely counterfeit.'", () => {
    expect(() => assertSafeLanguage("Definitely counterfeit.")).toThrow();
  });

  it("throws for 'guaranteed authentic.'", () => {
    expect(() => assertSafeLanguage("guaranteed authentic.")).toThrow();
  });

  it("includes context in error message when provided", () => {
    expect(() => assertSafeLanguage("fake goods", "red_flag[0]")).toThrow(/red_flag\[0\]/);
  });
});

describe("ALLOWED_PHRASES list", () => {
  it("contains expected safe phrases", () => {
    expect(ALLOWED_PHRASES).toContain("High replica-risk indicators found");
    expect(ALLOWED_PHRASES).toContain("AI-assisted risk screen, not formal authentication.");
  });
});
