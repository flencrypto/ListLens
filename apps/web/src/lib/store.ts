import type { StudioOutput, GuardOutput } from "./ai/schemas";

export const analysisStore = new Map<string, StudioOutput>();
export const guardStore = new Map<string, GuardOutput>();

export interface GuardCheckMeta {
  url?: string;
  screenshotUrls?: string[];
  lens?: string;
}
export const guardCheckMeta = new Map<string, GuardCheckMeta>();
