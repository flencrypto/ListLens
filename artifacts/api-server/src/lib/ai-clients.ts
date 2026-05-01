import OpenAI from "openai";

export function getXaiClient(): OpenAI {
  const apiKey = process.env["XAI_API_KEY"];
  if (!apiKey) throw new Error("XAI_API_KEY environment variable is not set");
  return new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
}

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey)
    throw new Error("OPENAI_API_KEY environment variable is not set");
  return new OpenAI({ apiKey });
}

export interface VisionClientInfo {
  client: OpenAI;
  model: string;
  provider: "xai" | "openai";
}

/**
 * Returns the best available vision-capable client.
 * Priority: xAI (Grok) → OpenAI (GPT-4o)
 */
export function getVisionClient(): VisionClientInfo {
  const xaiKey = process.env["XAI_API_KEY"];
  if (xaiKey) {
    return {
      client: new OpenAI({ apiKey: xaiKey, baseURL: "https://api.x.ai/v1" }),
      model: "grok-2-vision-1212",
      provider: "xai",
    };
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      model: "gpt-4o",
      provider: "openai",
    };
  }

  throw new Error(
    "No AI API key configured — set XAI_API_KEY (Grok) or OPENAI_API_KEY (GPT-4o)",
  );
}
