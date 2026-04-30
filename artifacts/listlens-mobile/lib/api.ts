function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
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

export interface ApiLensEntry {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  status: string;
}

export async function getLensRegistry(): Promise<{
  lenses: string[];
  registry: ApiLensEntry[];
}> {
  return get("/api/lenses");
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
