import { percentile, median } from "./quartiles";

export interface PricingResult {
  quickSale: number;
  recommended: number;
  high: number;
  confidence: number;
  currency: string;
}

/**
 * Derives quick-sale, recommended, and high prices from an array of comparable sale prices.
 *
 * Strategy:
 * - quickSale: 25th percentile (floor price — attracts fast buyers)
 * - recommended: median (typical market rate)
 * - high: 75th percentile (ceiling — for patient sellers with premium items)
 * - confidence: degrades with fewer comps; 1.0 = 10+ comps
 */
export function derivePricing(comps: number[], currency = "GBP"): PricingResult {
  if (comps.length === 0) {
    return { quickSale: 0, recommended: 0, high: 0, confidence: 0, currency };
  }

  const quickSale = Math.round(percentile(comps, 25) * 100) / 100;
  const recommended = Math.round(median(comps) * 100) / 100;
  const high = Math.round(percentile(comps, 75) * 100) / 100;

  // Confidence: full (1.0) at 10+ comps, degrades linearly to 0.3 at 1 comp.
  const confidence = Math.min(1.0, 0.3 + (comps.length - 1) * (0.7 / 9));

  return { quickSale, recommended, high, confidence: Math.round(confidence * 100) / 100, currency };
}
