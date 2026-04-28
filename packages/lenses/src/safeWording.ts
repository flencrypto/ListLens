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

/**
 * Word-boundary regexes shared by both detection (`findDisallowedPhrase`) and
 * sanitisation (`sanitiseSafeLanguage`) to keep the two consistent. Anything
 * matched here will be both flagged and replaced.
 *
 * Note: we intentionally use \b boundaries to avoid false positives like
 * "scampi" matching "scam" or "counterfeiting" matching "counterfeit" when
 * those words appear as inflections in unrelated contexts. The
 * `(?:\w*)` extensions cover common inflections (e.g. counterfeiting,
 * scammers) without grabbing unrelated words.
 */
const DISALLOWED_PATTERNS: Array<[RegExp, string]> = [
  [/\b(fakes?|counterfeit(?:s|ed|ing)?)\b/gi, "high replica-risk indicators found"],
  [/\b(scams?|scammers?|scamming)\b/gi, "seller with suspicious listing behaviour"],
  [/\b(fraud(?:ulent|s|sters?)?)\b/gi, "misleading listing"],
  // "guaranteed authentic" is a definitive authentication claim Guard must
  // never make — soften to a phrasing that does not assert authenticity.
  [/\bguaranteed\s+authentic\b/gi, "authenticity cannot be confirmed from the available evidence"],
];

/**
 * Sanitises a text string by replacing any disallowed phrases with safe alternatives.
 */
export function sanitiseSafeLanguage(text: string): string {
  return DISALLOWED_PATTERNS.reduce((t, [re, replacement]) => t.replace(re, replacement), text);
}

/**
 * Returns the first disallowed phrase found in the text, or undefined if clean.
 * Uses the same word-boundary regexes as `sanitiseSafeLanguage` so detection
 * and replacement stay aligned (no over-matching on substrings like "scampi").
 */
export function findDisallowedPhrase(text: string): string | undefined {
  for (const [re] of DISALLOWED_PATTERNS) {
    // RegExp objects with the `g` flag carry state via lastIndex; create a
    // fresh non-global copy here so repeated calls don't skip matches.
    const probe = new RegExp(re.source, re.flags.replace("g", ""));
    const match = probe.exec(text);
    if (match) return match[0];
  }
  return undefined;
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
