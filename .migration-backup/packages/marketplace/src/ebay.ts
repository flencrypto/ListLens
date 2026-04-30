import type { MarketplaceConnector, FormattedListing, FetchedListing } from "./connector";
import type { MarketplaceConnectorCapabilities, StudioOutput } from "@listlens/schemas";

const CAPABILITIES: MarketplaceConnectorCapabilities = {
  marketplace: "ebay",
  canPublish: true,
  canFetchListing: true,
  canExportCsv: false,
  supportedCategories: ["Footwear", "Clothing", "Electronics", "Music Media", "Vehicles Parts", "Trading Cards", "Toys"],
  requiredFields: ["title", "price", "condition", "category_id"],
  optionalFields: ["brand", "model", "description", "item_specifics"],
  sandbox: true,
};

export const ebayConnector: MarketplaceConnector = {
  id: "ebay",
  capabilities: CAPABILITIES,

  formatListing(analysis: StudioOutput): FormattedListing {
    const ebay = analysis.marketplace_outputs.ebay as Record<string, unknown>;
    return {
      title: (ebay.title as string | undefined) ?? `${analysis.identity.brand ?? ""} ${analysis.identity.model ?? ""}`.trim(),
      description: (ebay.description as string | undefined) ?? "",
      price: analysis.pricing.recommended,
      currency: analysis.pricing.currency,
      marketplace: "ebay",
      payload: ebay,
    };
  },

  async publishDraft(_listing: FormattedListing): Promise<{ listingId: string; url: string }> {
    // Stub: no real eBay API call
    const mockId = `ebay-sandbox-${Date.now()}`;
    return {
      listingId: mockId,
      url: `https://sandbox.ebay.com/itm/${mockId}`,
    };
  },

  async fetchListing(url: string): Promise<FetchedListing> {
    // Stub: returns mock data derived from the URL
    return {
      url,
      title: "Mock eBay Listing",
      price: 85.0,
      currency: "GBP",
      description: "Mock listing fetched from eBay sandbox.",
      images: ["https://example.com/img/placeholder.jpg"],
      sellerName: "mock_seller",
      marketplace: "ebay",
    };
  },
};
