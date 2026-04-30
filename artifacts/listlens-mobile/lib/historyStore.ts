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

export type RiskLevel = "low" | "medium" | "high" | "inconclusive";

export interface GuardReport {
  id: string;
  createdAt: number;
  lens: string;
  source: "url" | "screenshots";
  url: string;
  shots: string[];
  level: RiskLevel;
  summary: string;
  flags: { severity: "high" | "medium" | "low"; text: string }[];
  questions: string[];
  saved: boolean;
}

export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
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
  const reports = await readJson<GuardReport>(REPORTS_KEY);
  return reports.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReport(id: string): Promise<GuardReport | null> {
  const reports = await readJson<GuardReport>(REPORTS_KEY);
  return reports.find((r) => r.id === id) ?? null;
}

export async function saveReport(report: GuardReport): Promise<void> {
  const reports = await readJson<GuardReport>(REPORTS_KEY);
  const idx = reports.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    reports[idx] = report;
  } else {
    reports.push(report);
  }
  await writeJson(REPORTS_KEY, reports);
}

export async function deleteReport(id: string): Promise<void> {
  const reports = await readJson<GuardReport>(REPORTS_KEY);
  await writeJson(
    REPORTS_KEY,
    reports.filter((r) => r.id !== id),
  );
}
