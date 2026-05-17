import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Camera,
  CreditCard,
  FileText,
  History,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import {
  EvidenceStrip,
  HudPanel,
  LensOrb,
  LENS_ICON_MAP,
  ListLensShell,
  MiniEvidenceRow,
  StatusPill,
  toneClasses,
} from "@/components/listlens/hud";
import { Button } from "@/components/ui/button";
import { MVP_LENSES, SAFE_GUARD_PHRASES, WORKFLOW_STEPS } from "@/lib/listlens-mvp";
import { cn } from "@/lib/utils";

interface RecentActivity {
  id: string;
  type: "studio" | "guard";
  title: string;
  status: string;
  date: string;
  href: string;
}

interface ListingSummary {
  id: string;
  title: string | null;
  price: string | null;
  status: string;
  lens: string;
  photoUrls: string[];
  createdAt: string;
}

interface DashboardData {
  studioCount: number;
  guardCount: number;
  credits: number;
  planTier: string;
  recentActivity: RecentActivity[];
  listings: ListingSummary[];
}

const demoDashboard: DashboardData = {
  studioCount: 2,
  guardCount: 2,
  credits: 3,
  planTier: "free",
  recentActivity: [
    {
      id: "demo-studio-1",
      type: "studio",
      title: "Nike Dunk Low Panda UK 8",
      status: "draft",
      date: new Date().toISOString(),
      href: "/studio/new",
    },
    {
      id: "demo-guard-1",
      type: "guard",
      title: "Jordan 1 Lost & Found listing",
      status: "medium",
      date: new Date().toISOString(),
      href: "/guard/new",
    },
  ],
  listings: [
    {
      id: "demo-listing-1",
      title: "Nike Dunk Low Panda Black White Trainers UK 8",
      price: "82",
      status: "draft",
      lens: "ShoeLens",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-listing-2",
      title: "Sony Alpha A7 III camera body",
      price: "980",
      status: "needs-evidence",
      lens: "GeneralLens",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    },
  ],
};

function planLabel(tier: string): string {
  switch (tier) {
    case "studio_starter": return "Studio Starter";
    case "studio_reseller": return "Studio Reseller";
    case "guard_monthly": return "Guard Monthly";
    default: return "Free trial";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ActivityRow({ item }: { item: RecentActivity }) {
  const isStudio = item.type === "studio";
  return (
    <Link href={item.href}>
      <div className="group flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 transition hover:border-cyan-300/35 hover:bg-white/5">
        <LensOrb icon={isStudio ? Camera : ShieldCheck} tone={isStudio ? "cyan" : "violet"} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white group-hover:text-cyan-200">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {isStudio ? "Studio draft" : "Guard report"} · {formatDate(item.date)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-1 font-mono-hud text-[10px] uppercase tracking-[0.14em]",
            isStudio
              ? "border-cyan-300/25 text-cyan-200"
              : "border-violet-300/25 text-violet-200",
          )}
        >
          {item.status}
        </span>
      </div>
    </Link>
  );
}

function StatPanel({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "violet" | "green" | "amber";
  icon: typeof Camera;
}) {
  return (
    <HudPanel tone={tone} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono-hud text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        <LensOrb icon={icon} tone={tone} size="sm" />
      </div>
    </HudPanel>
  );
}

function ListingRow({ listing }: { listing: ListingSummary }) {
  const Icon = LENS_ICON_MAP[listing.lens] ?? Sparkles;
  return (
    <Link href={listing.id.startsWith("demo") ? "/studio/new" : `/studio/${listing.id}`}>
      <div className="group grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/35 hover:bg-white/5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <LensOrb icon={Icon} tone={listing.lens === "ShoeLens" ? "cyan" : "blue"} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{listing.title ?? `${listing.lens} draft`}</p>
          <p className="mt-1 text-xs text-slate-500">
            {listing.lens} · {formatDate(listing.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          {listing.price ? (
            <span className="font-mono-hud text-sm font-bold text-cyan-300">GBP {listing.price}</span>
          ) : null}
          <StatusPill tone={listing.status === "needs-evidence" ? "amber" : "cyan"}>
            {listing.status}
          </StatusPill>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | "signed-out">("demo");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/dashboard");
      if (response.status === 401) {
        setMode("signed-out");
        setData(demoDashboard);
        return;
      }
      if (!response.ok) throw new Error(`Dashboard unavailable (${response.status})`);
      const result = (await response.json()) as DashboardData;
      setMode("live");
      setData(result);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Dashboard unavailable");
      setMode("demo");
      // Keep previous data if available; fall back to demo only on first load
      setData((prev) => prev ?? demoDashboard);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchDashboard();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchDashboard]);

  const activeData = data ?? demoDashboard;
  const liveLens = useMemo(
    () => MVP_LENSES.filter((lens) => lens.status === "live" || lens.status === "fallback"),
    [],
  );

  return (
    <ListLensShell>
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {fetchError && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-700/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
            <span>⚠ {fetchError}. Showing cached data.</span>
            <button
              onClick={() => void fetchDashboard()}
              className="shrink-0 rounded border border-amber-600/50 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-800/40"
            >
              Retry
            </button>
          </div>
        )}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <HudPanel tone="cyan" className="p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill tone={mode === "live" ? "green" : "amber"}>
                    {mode === "live" ? "Live workspace" : mode === "signed-out" ? "Sign in available" : "Demo workspace"}
                  </StatusPill>
                  <StatusPill tone="cyan">{planLabel(activeData.planTier)}</StatusPill>
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  ListLens cockpit
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Start with Studio or Guard, then keep drafts, reports, credits and Lens evidence in one place.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg" className="border-0 bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300">
                  <Link href="/studio/new">
                    <Camera size={18} />
                    Create listing
                  </Link>
                </Button>
                <Button asChild size="lg" className="border-0 bg-violet-500 font-bold text-white hover:bg-violet-400">
                  <Link href="/guard/new">
                    <ShieldCheck size={18} />
                    Check listing
                  </Link>
                </Button>
              </div>
            </div>
            <EvidenceStrip className="mt-7" />
          </HudPanel>

          <HudPanel tone="violet" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Guard credits</h2>
                <p className="mt-1 text-sm text-slate-500">Point-of-need buyer checks.</p>
              </div>
              <LensOrb icon={WalletCards} tone="violet" />
            </div>
            <p className="mt-5 text-5xl font-black text-white">{loading ? "-" : activeData.credits}</p>
            <p className="mt-2 text-sm text-slate-400">
              {activeData.credits > 0
                ? "Credits available for full Guard reports."
                : "Buy a single Guard check or use demo mode while Stripe is not connected."}
            </p>
            <Button asChild variant="outline" className="mt-5 w-full border-violet-300/35 bg-violet-300/10 text-violet-100 hover:bg-violet-300/20">
              <Link href="/billing">
                <CreditCard size={16} />
                Manage credits
              </Link>
            </Button>
          </HudPanel>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatPanel label="Studio drafts" value={loading ? "-" : activeData.studioCount} tone="cyan" icon={FileText} />
          <StatPanel label="Guard reports" value={loading ? "-" : activeData.guardCount} tone="violet" icon={ShieldCheck} />
          <StatPanel label="Live lenses" value={liveLens.length} tone="green" icon={Sparkles} />
          <StatPanel label="Saved loop" value="Rev 1.0" tone="amber" icon={History} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <HudPanel tone="cyan" className="p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Saved Studio drafts</h2>
                <p className="mt-1 text-sm text-slate-500">Marketplace-ready drafts and missing-evidence notes.</p>
              </div>
              <Link href="/studio/new" className="text-sm font-semibold text-cyan-300 hover:text-white">
                New draft
              </Link>
            </div>
            <div className="space-y-3">
              {activeData.listings.length > 0 ? (
                activeData.listings.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-cyan-300/25 p-8 text-center">
                  <FileText className="mx-auto text-cyan-300" size={30} />
                  <p className="mt-3 text-sm font-semibold text-white">No drafts yet</p>
                  <p className="mt-1 text-xs text-slate-500">Upload photos in Studio to create your first draft.</p>
                </div>
              )}
            </div>
          </HudPanel>

          <div className="space-y-6">
            <HudPanel tone="violet" className="p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">Recent activity</h2>
                <Link href="/history" className="text-sm font-semibold text-violet-300 hover:text-white">
                  History
                </Link>
              </div>
              <div className="space-y-3">
                {activeData.recentActivity.length > 0 ? (
                  activeData.recentActivity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-violet-300/25 p-5 text-sm text-slate-500">
                    Your Studio drafts and Guard reports will appear here.
                  </p>
                )}
              </div>
            </HudPanel>

            <HudPanel tone="green" className="p-5">
              <h2 className="text-lg font-bold text-white">Rev 1.0 loop</h2>
              <div className="mt-4 space-y-3">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 font-mono-hud text-[10px] text-emerald-200">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </HudPanel>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <HudPanel tone="cyan" className="p-5">
            <h2 className="text-lg font-bold text-white">Lens routing</h2>
            <div className="mt-4 space-y-1">
              {liveLens.map((lens) => {
                const Icon = LENS_ICON_MAP[lens.id] ?? Sparkles;
                return (
                  <div key={lens.id} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-0">
                    <LensOrb icon={Icon} tone={lens.accent} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{lens.displayName}</p>
                      <p className="text-xs text-slate-500">{lens.category}</p>
                    </div>
                    <StatusPill tone={lens.accent}>{lens.phase}</StatusPill>
                  </div>
                );
              })}
            </div>
          </HudPanel>

          <HudPanel tone="violet" className="p-5">
            <h2 className="text-lg font-bold text-white">Safe Guard wording</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Guard reports stay in evidence and risk language. They do not claim formal authentication.
            </p>
            <div className="mt-4 space-y-1">
              {SAFE_GUARD_PHRASES.slice(0, 4).map((phrase) => (
                <MiniEvidenceRow key={phrase} label={phrase} value="Allowed" tone="green" />
              ))}
            </div>
          </HudPanel>
        </section>
      </main>
    </ListLensShell>
  );
}

