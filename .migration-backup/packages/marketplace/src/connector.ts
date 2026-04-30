import type { MarketplaceConnectorCapabilities } from "@listlens/schemas";
import type { StudioOutput } from "@listlens/schemas";

export interface FormattedListing {
  title: string;
  description: string;
  price: number;
  currency: string;
  marketplace: string;
  payload: Record<string, unknown>;
}

export interface FetchedListing {
  url: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  sellerName?: string;
  marketplace: string;
}

export interface MarketplaceConnector {
  readonly id: string;
  readonly capabilities: MarketplaceConnectorCapabilities;
  formatListing(analysis: StudioOutput): FormattedListing;
  publishDraft(listing: FormattedListing): Promise<{ listingId: string; url: string }>;
  fetchListing(url: string): Promise<FetchedListing>;
}
