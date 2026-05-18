export type AiProvider = {
  id: "xai" | "openai";
  label: string;
  envVar: string;
  role: string;
};

export const aiProviders: AiProvider[] = [
  {
    id: "xai",
    label: "xAI API",
    envVar: "XAI_API",
    role: "visual reasoning, anomaly triage, and inspection assist",
  },
  {
    id: "openai",
    label: "OpenAI API",
    envVar: "OPENAI_API",
    role: "structured reports, listing copy, explanations, and support",
  },
];
