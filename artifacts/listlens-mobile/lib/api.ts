function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/gif": "gif",
};

/**
 * Upload a local photo URI to object storage and return the accessible URL.
 * Uses the two-step presigned URL flow to avoid embedding base64 in JSON bodies.
 */
export async function uploadPhoto(
  uri: string,
  mimeType: string = "image/jpeg",
): Promise<string> {
  const apiBase = getApiBase();
  const ext = MIME_TO_EXT[mimeType] ?? "jpg";

  const localRes = await fetch(uri);
  const blob = await localRes.blob();

  const urlRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `photo-${Date.now()}.${ext}`,
      size: blob.size,
      contentType: mimeType,
    }),
  });

  if (!urlRes.ok) {
    throw new Error(`Failed to get upload URL (${urlRes.status})`);
  }

  const { uploadURL, objectPath } = (await urlRes.json()) as {
    uploadURL: string;
    objectPath: string;
  };

  const putRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error(`Failed to upload photo to storage (${putRes.status})`);
  }

  return `${apiBase}/api/storage${objectPath}`;
}

let _getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(fn: () => Promise<string | null>): void {
  _getAuthToken = fn;
}

async function post<T>(path: string, data: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_getAuthToken) {
    const token = await _getAuthToken().catch(() => null);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    throw new Error(`API ${path} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_getAuthToken) {
    const token = await _getAuthToken().catch(() => null);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${getApiBase()}${path}`, { method: "GET", headers });
  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    throw new Error(`API ${path} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

export interface RecentActivityItem {
  id: string;
  type: "studio" | "guard";
  title: string;
  status: string;
  date: string;
  href: string;
}

export interface DashboardData {
  studioCount: number;
  guardCount: number;
  credits: number;
  planTier: string;
  recentActivity: RecentActivityItem[];
}

export async function getDashboard(): Promise<DashboardData> {
  return get<DashboardData>("/api/dashboard");
}

export interface StudioAnalysis {
  mode: "studio";
  lens: string;
  listing_description: string;
  identity: {
    brand: string | null;
    model: string | null;
    confidence: number;
  };
  attributes: Record<string, unknown>;
  missing_photos: string[];
  pricing: {
    quick_sale: number;
    recommended: number;
    high: number;
    currency: string;
    confidence: number;
  };
  marketplace_outputs: {
    ebay: { title?: string; condition?: string; category?: string; [k: string]: unknown };
    vinted: { title?: string; category?: string; [k: string]: unknown };
  };
  warnings: string[];
}

export interface RecordAnalysis {
  mode: string;
  lens: string;
  input_type: string;
  top_match: {
    artist: string | null;
    title: string | null;
    label: string | null;
    catalogue_number: string | null;
    likely_release: string;
    likelihood_percent: number;
    evidence: string[];
    discogs?: Record<string, unknown>;
  };
  alternate_matches: Array<Record<string, unknown>>;
  needs_matrix_for_clarification: boolean;
  matrix_clarification_questions: string[];
  warnings: string[];
  disclaimer: string;
}

export async function createItem(params: {
  lens: string;
  marketplace: string;
  photoUrls: string[];
}): Promise<{ id: string; lens: string; marketplace: string | undefined; status: string }> {
  return post("/api/items", params);
}

export async function analyseItem(
  id: string,
  params: { lens: string; photoUrls: string[]; hint?: string },
): Promise<{ analysis: StudioAnalysis }> {
  return post(`/api/items/${id}/analyse`, params);
}

export interface AnalysisCorrections {
  matrix_a?: string;
  matrix_b?: string;
  country?: string;
  year?: string;
  catalogue_number?: string;
  label?: string;
  artist?: string;
  title?: string;
}

export async function reanalyseItem(
  id: string,
  corrections: AnalysisCorrections,
): Promise<{ analysis: StudioAnalysis }> {
  return post(`/api/items/${id}/reanalyse`, { corrections });
}

export async function identifyRecord(params: {
  labelUrls: string[];
  matrixUrls?: string[];
}): Promise<{ analysis: RecordAnalysis }> {
  const path =
    params.matrixUrls && params.matrixUrls.length > 0
      ? "/api/lenses/record/identify-with-matrix"
      : "/api/lenses/record/identify";
  return post(path, params);
}

export interface PressingConfirmResult {
  identification: RecordAnalysis;
  analysis?: StudioAnalysis;
}

export async function confirmPressing(params: {
  itemId: string;
  matrixSideA?: string;
  matrixSideB?: string;
  matrixSideCD?: string;
}): Promise<PressingConfirmResult> {
  return post("/api/lenses/record/identify-with-matrix", params);
}

export interface ItemSpecific {
  name: string;
  value: string;
  autoFilled: boolean;
}

export async function getItemSpecifics(itemId: string): Promise<{ specifics: ItemSpecific[] }> {
  return get<{ specifics: ItemSpecific[] }>(`/api/items/${itemId}/item-specifics`);
}

export interface EbayPublishResult {
  ok: boolean;
  listingId: string;
  viewItemURL: string;
}

export async function publishItemToEbay(
  itemId: string,
  params: {
    title: string;
    description: string;
    price: number;
    lens: string;
    specificsOverrides?: { name: string; value: string }[];
  },
): Promise<EbayPublishResult> {
  return post<EbayPublishResult>(`/api/items/${itemId}/publish/ebay-sandbox`, params);
}

export interface ApiLensEntry {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  status: string;
}

export interface ApiListing {
  id: string;
  lens: string;
  marketplace: string | null;
  photoUrls: string[];
  title: string | null;
  description: string | null;
  price: string | null;
  analysis: Record<string, unknown> | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function getItems(): Promise<{ listings: ApiListing[] }> {
  return get<{ listings: ApiListing[] }>("/api/items");
}

export async function getItem(id: string): Promise<{ listing: ApiListing }> {
  return get<{ listing: ApiListing }>(`/api/items/${id}`);
}

export interface ApiGuardCheck {
  id: string;
  lens: string;
  url: string | null;
  riskLevel: string | null;
  status: string;
  createdAt: string;
}

export async function listItems(): Promise<ApiListing[]> {
  const data = await get<{ listings: ApiListing[] }>("/api/items");
  return data.listings ?? [];
}

export async function listGuardChecks(): Promise<ApiGuardCheck[]> {
  const data = await get<{ checks: ApiGuardCheck[] }>("/api/guard/checks");
  return data.checks ?? [];
}

export async function getLensRegistry(): Promise<{
  lenses: string[];
  registry: ApiLensEntry[];
}> {
  return get("/api/lenses");
}

export interface EbayStatus {
  connected: boolean;
  expiresAt: string | null;
  sandbox: boolean;
  credentialsMissing: boolean;
}

export async function getEbayStatus(): Promise<EbayStatus> {
  return get<EbayStatus>("/api/ebay/status");
}

export async function getEbayMobileConnectUrl(): Promise<{ url: string }> {
  return get<{ url: string }>("/api/ebay/mobile-connect");
}

export async function disconnectEbay(): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>("/api/ebay/disconnect", {});
}

/**
 * Direct specialist-lens analysis — calls the lens-specific route without
 * creating a persistent item record. Use `analyseItem` instead when you need
 * history tracking and item-level export. This path is intended for stateless
 * preview/draft checks on individual specialist lenses.
 */
export async function analyseLens(params: {
  lens: string;
  photoUrls: string[];
  hint?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ analysis: StudioAnalysis }> {
  const lensRouteMap: Record<string, string> = {
    LPLens: "/api/lenses/lp",
    ClothingLens: "/api/lenses/clothing",
    CardLens: "/api/lenses/card",
    ToyLens: "/api/lenses/toy",
    WatchLens: "/api/lenses/watch",
    MeasureLens: "/api/lenses/measure",
    MotorLens: "/api/lenses/motor",
  };
  const path = lensRouteMap[params.lens];
  if (!path) {
    throw new Error(`No specialist lens route for ${params.lens}`);
  }
  return post(path, {
    photoUrls: params.photoUrls,
    hint: params.hint,
    metadata: params.metadata,
  });
}
