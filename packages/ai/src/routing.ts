export type ModelTask = "classify" | "listing" | "reasoning" | "vision" | "embeddings";

export interface ModelChoice {
  provider: "openai";
  model: string;
  maxTokens: number;
  temperature: number;
}

const MODEL_MAP: Record<ModelTask, ModelChoice> = {
  classify: { provider: "openai", model: "gpt-4o-mini", maxTokens: 512, temperature: 0.1 },
  listing: { provider: "openai", model: "gpt-4o", maxTokens: 2048, temperature: 0.7 },
  reasoning: { provider: "openai", model: "o1-mini", maxTokens: 4096, temperature: 1.0 },
  vision: { provider: "openai", model: "gpt-4o", maxTokens: 2048, temperature: 0.2 },
  embeddings: { provider: "openai", model: "text-embedding-3-small", maxTokens: 8192, temperature: 0.0 },
};

export function routeModel(task: ModelTask): ModelChoice {
  return MODEL_MAP[task];
}
