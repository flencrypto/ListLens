import type { StudioAnalysis } from "@/lib/api";
import type { StudioDraft } from "@/lib/historyStore";

export type DraftBody = Omit<StudioDraft, "id" | "createdAt" | "updatedAt">;

export const DEFAULT_DRAFT_BODY: DraftBody = {
  lens: "ShoeLens",
  marketplace: "both",
  photos: [],
  title: "AI-drafted listing",
  brand: "",
  size: "",
  description: "Listing drafted from your photos.",
  bullets: [],
  pricing: { quick: 0, recommended: 0, high: 0 },
  flags: [],
  exported: "none",
};

export function analysisToBody(
  analysis: StudioAnalysis,
  lens: string,
  marketplace: string,
  photos: string[],
): DraftBody {
  const ebay = analysis.marketplace_outputs?.ebay ?? {};
  const vinted = analysis.marketplace_outputs?.vinted ?? {};
  const identityStr =
    [analysis.identity?.brand, analysis.identity?.model]
      .filter(Boolean)
      .join(" ") || "AI-drafted listing";
  const title =
    (ebay["title"] as string | undefined) ??
    (vinted["title"] as string | undefined) ??
    identityStr;

  const attrs = analysis.attributes ?? {};

  const size =
    (attrs["size"] as string | undefined) ??
    (attrs["Size"] as string | undefined) ??
    (attrs["size_label"] as string | undefined) ??
    "";

  function flattenAttr(key: string, value: unknown): string {
    if (value === null || value === undefined) return `${key}: —`;
    if (typeof value !== "object") return `${key}: ${String(value)}`;
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${String(v)}`);
    return `${key} — ${entries.join(", ")}`;
  }

  const SKIP_KEYS = new Set(["size", "Size", "size_label"]);

  const bullets: string[] = Object.entries(attrs)
    .filter(([k]) => !SKIP_KEYS.has(k))
    .slice(0, 8)
    .map(([k, v]) => flattenAttr(k, v));

  const flags: DraftBody["flags"] = [
    ...(analysis.missing_photos ?? []).map((text) => ({
      severity: "medium" as const,
      text,
    })),
    ...(analysis.warnings ?? []).map((text) => ({
      severity: "low" as const,
      text,
    })),
  ];

  return {
    lens,
    marketplace,
    photos,
    title,
    brand: analysis.identity?.brand ?? "",
    size,
    description: analysis.listing_description ?? "",
    bullets,
    pricing: {
      quick: analysis.pricing?.quick_sale ?? 0,
      recommended: analysis.pricing?.recommended ?? 0,
      high: analysis.pricing?.high ?? 0,
    },
    flags,
    exported: "none",
  };
}
