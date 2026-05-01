import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFTS_KEY = "listlens.history.drafts.v1";
const REPORTS_KEY = "listlens.history.reports.v1";

export interface StudioDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
  lens: string;
  marketplace: string;
  photos: string[];
  title: string;
  brand: string;
  size: string;
  description: string;
  bullets: string[];
  pricing: { quick: number; recommended: number; high: number };
  flags: { severity: "high" | "medium" | "low"; text: string }[];
  exported: "none" | "ebay" | "vinted";
}

export type RiskLevel = "low" | "medium" | "medium_high" | "high" | "inconclusive";

export interface GuardRiskDimension {
  score: number;
  verdict: string;
}

export interface GuardReport {
  id: string;
  createdAt: number;
  lens: string;
  source: "url" | "screenshots";
  url: string;
  shots: string[];
  saved: boolean;
  risk: {
    level: RiskLevel;
    confidence: number;
    summary: string;
  };
  risk_dimensions: {
    price: GuardRiskDimension;
    photos: GuardRiskDimension;
    listing_quality: GuardRiskDimension;
    item_authenticity: GuardRiskDimension;
    seller_signals: GuardRiskDimension;
  };
  red_flags: Array<{
    severity: "low" | "medium" | "high";
    type: string;
    message: string;
  }>;
  green_signals: Array<{
    type: string;
    message: string;
  }>;
  price_analysis: {
    asking_price: string | null;
    market_estimate: string | null;
    price_verdict: "fair" | "low_risk_deal" | "suspiciously_low" | "overpriced" | "unknown";
    price_note: string;
  };
  authenticity_signals: Array<{
    marker: string;
    observed: string;
    verdict: "pass" | "fail" | "unclear";
  }>;
  missing_photos: string[];
  seller_questions: string[];
  buy_recommendation: {
    verdict: "proceed" | "proceed_with_caution" | "ask_questions_first" | "avoid";
    reasoning: string;
  };
}

export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULT_RISK_DIMENSION: GuardRiskDimension = { score: 5, verdict: "No data available." };

function normalizeReport(raw: Record<string, unknown>): GuardReport {
  if (raw.risk && typeof raw.risk === "object") {
    const r = raw as Record<string, unknown>;
    return {
      ...(r as unknown as GuardReport),
      red_flags: Array.isArray(r.red_flags) ? (r.red_flags as GuardReport["red_flags"]) : [],
      green_signals: Array.isArray(r.green_signals) ? (r.green_signals as GuardReport["green_signals"]) : [],
      authenticity_signals: Array.isArray(r.authenticity_signals) ? (r.authenticity_signals as GuardReport["authenticity_signals"]) : [],
      missing_photos: Array.isArray(r.missing_photos) ? (r.missing_photos as string[]) : [],
      seller_questions: Array.isArray(r.seller_questions) ? (r.seller_questions as string[]) : [],
    };
  }
  const legacyLevel = (raw.level as RiskLevel | undefined) ?? "inconclusive";
  const legacyFlags = (raw.flags as Array<{ severity: "low" | "medium" | "high"; text: string }> | undefined) ?? [];
  return {
    id: String(raw.id ?? ""),
    createdAt: Number(raw.createdAt ?? 0),
    lens: String(raw.lens ?? "ShoeLens"),
    source: (raw.source as "url" | "screenshots" | undefined) ?? "url",
    url: String(raw.url ?? ""),
    shots: Array.isArray(raw.shots) ? (raw.shots as string[]) : [],
    saved: Boolean(raw.saved),
    risk: {
      level: legacyLevel,
      confidence: 0,
      summary: String(raw.summary ?? ""),
    },
    risk_dimensions: {
      price: DEFAULT_RISK_DIMENSION,
      photos: DEFAULT_RISK_DIMENSION,
      listing_quality: DEFAULT_RISK_DIMENSION,
      item_authenticity: DEFAULT_RISK_DIMENSION,
      seller_signals: DEFAULT_RISK_DIMENSION,
    },
    red_flags: legacyFlags.map((f) => ({
      severity: f.severity,
      type: "FLAG",
      message: f.text,
    })),
    green_signals: [],
    price_analysis: {
      asking_price: null,
      market_estimate: null,
      price_verdict: "unknown",
      price_note: "",
    },
    authenticity_signals: [],
    missing_photos: [],
    seller_questions: Array.isArray(raw.questions) ? (raw.questions as string[]) : [],
    buy_recommendation: {
      verdict: "proceed_with_caution",
      reasoning: "",
    },
  };
}

async function readJson<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function readReports(): Promise<GuardReport[]> {
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Record<string, unknown>[]).map(normalizeReport);
  } catch {
    return [];
  }
}

async function writeJson<T>(key: string, value: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function listDrafts(): Promise<StudioDraft[]> {
  const drafts = await readJson<StudioDraft>(DRAFTS_KEY);
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDraft(id: string): Promise<StudioDraft | null> {
  const drafts = await readJson<StudioDraft>(DRAFTS_KEY);
  return drafts.find((d) => d.id === id) ?? null;
}

export async function saveDraft(draft: StudioDraft): Promise<void> {
  const drafts = await readJson<StudioDraft>(DRAFTS_KEY);
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  await writeJson(DRAFTS_KEY, drafts);
}

export async function deleteDraft(id: string): Promise<void> {
  const drafts = await readJson<StudioDraft>(DRAFTS_KEY);
  await writeJson(
    DRAFTS_KEY,
    drafts.filter((d) => d.id !== id),
  );
}

export async function listReports(): Promise<GuardReport[]> {
  const reports = await readReports();
  return reports.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReport(id: string): Promise<GuardReport | null> {
  const reports = await readReports();
  return reports.find((r) => r.id === id) ?? null;
}

export async function saveReport(report: GuardReport): Promise<void> {
  const reports = await readReports();
  const idx = reports.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    reports[idx] = report;
  } else {
    reports.push(report);
  }
  await writeJson(REPORTS_KEY, reports);
}

export async function deleteReport(id: string): Promise<void> {
  const reports = await readReports();
  await writeJson(
    REPORTS_KEY,
    reports.filter((r) => r.id !== id),
  );
}
