/**
 * Safe-language guardrails for Guard AI output.
 * Spec §6: Guard must NEVER use forbidden phrases about counterfeit/fraud.
 */

export const ALLOWED_PHRASES: readonly string[] = [
  "High replica-risk indicators found",
  "Authenticity cannot be confirmed from the available evidence",
  "Seller behaviour raises concerns",
  "Listing lacks expected authenticity evidence",
  "AI-assisted risk screen, not formal authentication.",
  "Request additional photos to proceed",
  "Price is below typical market value",
];

export const DISALLOWED_PHRASES: readonly string[] = [
  "This is fake.",
  "Definitely counterfeit.",
  "guaranteed authentic.",
  "This seller is a scammer.",
  "This is a scam.",
  "This is fraudulent.",
  "fake",
  "counterfeit",
  "scammer",
  "scam",
  "fraud",
  "fraudulent",
];

const SAFE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(fake|counterfeit)\b/gi, "high replica-risk indicators found in"],
  [/\b(scammer|scam)\b/gi, "seller with suspicious listing behaviour"],
  [/\b(fraud(?:ulent)?)\b/gi, "misleading listing"],
];

/**
 * Sanitises a text string by replacing any disallowed phrases with safe alternatives.
 */
export function sanitiseSafeLanguage(text: string): string {
  return SAFE_REPLACEMENTS.reduce((t, [re, replacement]) => t.replace(re, replacement), text);
}

/**
 * Returns the first disallowed phrase found in the text, or undefined if clean.
 */
export function findDisallowedPhrase(text: string): string | undefined {
  const lower = text.toLowerCase();
  return DISALLOWED_PHRASES.find((p) => lower.includes(p.toLowerCase()));
}

/**
 * Validates that text does NOT contain any disallowed phrases.
 * Throws if a disallowed phrase is found.
 */
export function assertSafeLanguage(text: string, context?: string): void {
  const found = findDisallowedPhrase(text);
  if (found !== undefined) {
    throw new Error(
      `Disallowed phrase "${found}" found in Guard output${context ? ` (${context})` : ""}. ` +
        "Use safe alternatives such as: " + ALLOWED_PHRASES.slice(0, 3).join(", ")
    );
  }
}
