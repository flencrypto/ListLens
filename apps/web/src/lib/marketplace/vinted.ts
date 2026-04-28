export function buildVintedDraft(analysis: {
  marketplace_outputs: { vinted: Record<string, unknown> };
  identity: { brand: string | null; model: string | null };
  pricing: { recommended: number };
}) {
  return {
    title: analysis.marketplace_outputs.vinted.title as string,
    description: analysis.marketplace_outputs.vinted.description as string,
    price: analysis.pricing.recommended,
    brand: analysis.identity.brand,
  };
}
