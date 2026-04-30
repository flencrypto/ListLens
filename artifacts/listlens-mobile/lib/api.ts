function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

async function post<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    throw new Error(`API ${path} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
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
  params: { lens: string; photoUrls: string[] },
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
