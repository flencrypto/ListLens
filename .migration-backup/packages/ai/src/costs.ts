export interface CostRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  timestamp: Date;
  jobType?: string;
}

// Approximate pricing as of 2024-12 (USD per 1M tokens)
const PRICE_PER_1M: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "o1-mini": { input: 1.1, output: 4.4 },
  "text-embedding-3-small": { input: 0.02, output: 0 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const prices = PRICE_PER_1M[model] ?? { input: 10.0, output: 30.0 };
  return ((inputTokens * prices.input) + (outputTokens * prices.output)) / 1_000_000;
}

export function createCostRecord(
  model: string,
  inputTokens: number,
  outputTokens: number,
  jobType?: string
): CostRecord {
  return {
    model,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
    timestamp: new Date(),
    jobType,
  };
}
