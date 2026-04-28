import type { StudioOutput, GuardOutput } from "./ai/schemas";

export const analysisStore = new Map<string, StudioOutput>();
export const guardStore = new Map<string, GuardOutput>();

// Ownership maps: resource id → userId that created it
export const itemOwner = new Map<string, string>();
export const guardOwner = new Map<string, string>();

export interface ItemMeta {
  lens?: string;
  marketplace?: string;
}
/** Per-item metadata (lens/marketplace) carried from creation through analysis. */
export const itemMeta = new Map<string, ItemMeta>();

export interface GuardCheckMeta {
  url?: string;
  screenshotUrls?: string[];
  lens?: string;
}
export const guardCheckMeta = new Map<string, GuardCheckMeta>();

/** Returns true if the given userId owns the item, or if no owner was recorded (legacy). */
export function userOwnsItem(id: string, userId: string): boolean {
  const owner = itemOwner.get(id);
  return owner === undefined || owner === userId;
}

/** Returns true if the given userId owns the guard check, or if no owner was recorded. */
export function userOwnsGuardCheck(id: string, userId: string): boolean {
  const owner = guardOwner.get(id);
  return owner === undefined || owner === userId;
}
