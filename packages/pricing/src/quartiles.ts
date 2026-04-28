/**
 * Sorts a numeric array in ascending order (non-mutating).
 */
export function sortAsc(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

/**
 * Computes the median of an array of numbers.
 * Returns 0 for empty arrays.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = sortAsc(values);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

/**
 * Computes the Nth percentile using linear interpolation (same as Excel PERCENTILE).
 * Returns 0 for empty arrays or invalid percentile.
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new RangeError(`percentile p must be 0–100, got ${p}`);
  const sorted = sortAsc(values);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower]!;
  const fraction = index - lower;
  return sorted[lower]! * (1 - fraction) + sorted[upper]! * fraction;
}
