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
