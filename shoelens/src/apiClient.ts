import type { MarketplaceAgentResult } from "./data/marketplaceAgent";
import type { ProductCandidate, ScanSlot } from "./data/soleLensData";

export type ProviderStatus = {
  openai: boolean;
  xai: boolean;
  openaiModel: string;
  xaiModel: string;
};

export type ListingDraft = {
  title: string;
  description: string;
  checklist: string[];
  priceRationale?: string;
};

export type ScanAnalysisResult = {
  summary: string;
  identityConfidenceDelta: number;
  authenticityRisk: string;
  recommendedAction: string;
  evidence: string[];
  missingEvidence: string[];
};

export type ApiResponseMeta = {
  ok: boolean;
  mode: "provider" | "fallback";
  provider: "openai" | "xai" | "local";
  providerStatus: ProviderStatus;
  errors?: Array<{ provider: string; message: string }>;
};

export type RealCatalogProfile = {
  id: string;
  className: string;
  brand: string;
  model: string;
  referenceId: string;
  imageCount: number;
  availableImageCount: number;
  averageImage: {
    width: number;
    height: number;
  };
  corruptFiles: number;
  sampleImages: string[];
};

export type CatalogSummary = {
  profileCount: number;
  imageCount: number;
  availableImageCount: number;
  sampleImageCount: number;
  corruptFileCount: number;
  brands: string[];
  sourceArchive: string;
  generatedFrom: string;
};

export type MarketplaceFeedStatus = {
  enabled: boolean;
  reason: string;
  requiredForProductionComps: string[];
};

export type DataReadiness = {
  ok: boolean;
  catalog: {
    available: boolean;
    catalogPath: string;
    profiles: number;
    referenceImages: number;
    extractedSamples: number;
    corruptFiles: number;
    brands: string[];
    sourceArchive: string | null;
  };
  aiProviders: ProviderStatus;
  marketplaceFeeds: MarketplaceFeedStatus;
  productionStatus: {
    referenceCatalog: boolean;
    liveAi: boolean;
    liveMarketplaceComps: boolean;
  };
};

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok || body.ok === false) {
    throw new Error(body.error ?? `API request failed with ${response.status}`);
  }
  return body as T;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok || body.ok === false) {
    throw new Error(body.error ?? `API request failed with ${response.status}`);
  }
  return body as T;
}

export function requestScanAnalysis(payload: {
  product: ProductCandidate;
  slots: ScanSlot[];
  capturedRequired: number;
  requiredTotal: number;
}): Promise<ApiResponseMeta & { analysis: ScanAnalysisResult }> {
  return postJson("/api/ai/scan-analysis", payload);
}

export function requestListingDraft(payload: {
  product: ProductCandidate;
  marketplaceAgentResults: MarketplaceAgentResult[];
  conditionFindings: Array<{ label: string; value: string; state: string }>;
  marketplaceFeedStatus?: MarketplaceFeedStatus;
}): Promise<ApiResponseMeta & { listing: ListingDraft }> {
  return postJson("/api/ai/listing-draft", payload);
}

export function requestDataReadiness(): Promise<DataReadiness> {
  return getJson("/api/data/readiness");
}

export function requestCatalog(): Promise<{
  ok: true;
  schemaVersion: number;
  summary: CatalogSummary;
  profiles: RealCatalogProfile[];
  marketplaceFeeds: MarketplaceFeedStatus;
}> {
  return getJson("/api/data/catalog");
}
