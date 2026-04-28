export { SHOELENS_CONFIG } from "./shoelens";
export { LPLENS_CONFIG } from "./lplens";
export { RECORDLENS_CONFIG } from "./recordlens";
export { CLOTHINGLENS_CONFIG } from "./clothinglens";
export { WATCHLENS_CONFIG } from "./watchlens";
export { MOTORLENS_CONFIG } from "./motorlens";
export { CARDLENS_CONFIG } from "./cardlens";
export { TOYLENS_CONFIG } from "./toylens";
export { MEASURELENS_CONFIG } from "./measurelens";
export {
  ALLOWED_PHRASES,
  DISALLOWED_PHRASES,
  sanitiseSafeLanguage,
  findDisallowedPhrase,
  assertSafeLanguage,
} from "./safeWording";
export {
  LENS_REGISTRY,
  getLens,
  type LensRegistryEntry,
  type LensStatus,
} from "./registry";
export type { ShoeLensSellerAttributes } from "./shoelens";

/**
 * Canonical lens identifier union. Mirrors `LensIdSchema` in
 * `@listlens/schemas` but is duplicated here as a plain string-literal type
 * so this package can stay free of the schemas dependency.
 *
 * `RecordLens` is the canonical music-media lens; `LPLens` is retained as a
 * back-compat alias for older integrations.
 */
export type LensId =
  | "ShoeLens"
  | "ClothingLens"
  | "MeasureLens"
  | "RecordLens"
  | "LPLens"
  | "WatchLens"
  | "MotorLens"
  | "CardLens"
  | "ToyLens";

export function routeLens(hint: string): LensId {
  const h = hint.toLowerCase();
  if (h.includes("shoe") || h.includes("boot") || h.includes("trainer") || h.includes("sneaker")) return "ShoeLens";
  if (h.includes("clothing") || h.includes("jacket") || h.includes("shirt") || h.includes("dress")) return "ClothingLens";
  if (h.includes("watch") || h.includes("timepiece")) return "WatchLens";
  if (h.includes("vinyl") || h.includes("lp") || h.includes("record") || h.includes("album") || h.includes("cd") || h.includes("cassette")) return "RecordLens";
  if (h.includes("motor") || h.includes("car") || h.includes("vehicle") || h.includes("part")) return "MotorLens";
  if (h.includes("card") || h.includes("pokemon") || h.includes("trading")) return "CardLens";
  if (h.includes("toy") || h.includes("lego") || h.includes("game")) return "ToyLens";
  if (h.includes("measure")) return "MeasureLens";
  return "ShoeLens"; // default
}
