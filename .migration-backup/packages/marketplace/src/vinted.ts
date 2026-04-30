import type { MarketplaceConnector, FormattedListing, FetchedListing } from "./connector";
import type { MarketplaceConnectorCapabilities, StudioOutput } from "@listlens/schemas";

const CAPABILITIES: MarketplaceConnectorCapabilities = {
  marketplace: "vinted",
  canPublish: false,
  canFetchListing: true,
  canExportCsv: true,
  supportedCategories: ["Footwear", "Clothing", "Accessories"],
  requiredFields: ["title", "price", "brand"],
  optionalFields: ["description", "condition", "size"],
  sandbox: false,
};

export const vintedConnector: MarketplaceConnector = {
  id: "vinted",
  capabilities: CAPABILITIES,

  formatListing(analysis: StudioOutput): FormattedListing {
    const vinted = analysis.marketplace_outputs.vinted as Record<string, unknown>;
    return {
      title: (vinted.title as string | undefined) ?? `${analysis.identity.brand ?? ""} ${analysis.identity.model ?? ""}`.trim(),
      description: (vinted.description as string | undefined) ?? "",
      price: (vinted.price_suggestion as number | undefined) ?? analysis.pricing.recommended,
      currency: analysis.pricing.currency,
      marketplace: "vinted",
      payload: vinted,
    };
  },

  async publishDraft(_listing: FormattedListing): Promise<{ listingId: string; url: string }> {
    throw new Error("Vinted does not support direct publishing via API. Use CSV export.");
  },

  async fetchListing(url: string): Promise<FetchedListing> {
    return {
      url,
      title: "Mock Vinted Listing",
      price: 40.0,
      currency: "EUR",
      description: "Mock listing fetched from Vinted.",
      images: ["https://example.com/img/placeholder.jpg"],
      sellerName: "mock_vinted_seller",
      marketplace: "vinted",
    };
  },
};
