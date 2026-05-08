/**
 * Combines multiple confidence scores using a weighted geometric mean.
 * A single score of 0 results in an overall confidence of 0 (one weak link = low overall).
 */
export function combineConfidences(
  scores: number[],
  weights?: number[]
): number {
  if (scores.length === 0) return 0;
  const w = weights ?? scores.map(() => 1);
  if (w.length !== scores.length) throw new Error("weights length must match scores length");

  const totalWeight = w.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;

  // Weighted geometric mean
  const logSum = scores.reduce((sum, score, i) => {
    const clamped = Math.max(0, Math.min(1, score));
    // Avoid log(0): use a tiny epsilon
    return sum + w[i]! * Math.log(clamped === 0 ? 1e-10 : clamped);
  }, 0);

  return Math.exp(logSum / totalWeight);
}

/**
 * Penalises a base confidence based on the number of warnings.
 */
export function penaliseForWarnings(baseConfidence: number, warningCount: number): number {
  const penalty = Math.min(warningCount * 0.1, 0.5);
  return Math.max(0, baseConfidence - penalty);
}

/**
 * Returns a human-readable label for a confidence score.
 */
export function confidenceLabel(score: number): "high" | "medium" | "low" {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
