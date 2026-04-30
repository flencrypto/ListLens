export function buildEbayPayload(analysis: {
  marketplace_outputs: { ebay: Record<string, unknown> };
  identity: { brand: string | null; model: string | null };
  pricing: { recommended: number };
}) {
  return {
    title: analysis.marketplace_outputs.ebay.title as string,
    description: analysis.marketplace_outputs.ebay.description as string,
    startPrice: { value: String(analysis.pricing.recommended), currencyID: "GBP" },
    primaryCategory: { categoryID: analysis.marketplace_outputs.ebay.category_id as string },
    conditionID: analysis.marketplace_outputs.ebay.condition_id as string,
    itemSpecifics: analysis.marketplace_outputs.ebay.item_specifics,
  };
}
