import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUICK_LINKS = [
  { href: "/studio/new", label: "New Listing", desc: "Photos → AI listing draft", icon: "📸", color: "from-cyan-500 to-blue-600" },
  { href: "/guard/new", label: "Check Listing", desc: "URL → Risk report", icon: "🛡️", color: "from-violet-500 to-purple-600" },
  { href: "/history", label: "History", desc: "Past listings & checks", icon: "📋", color: "from-zinc-600 to-zinc-700" },
  { href: "/billing", label: "Billing", desc: "Plans & credits", icon: "💳", color: "from-emerald-600 to-teal-700" },
];

interface RecentActivity {
  id: string;
  type: "studio" | "guard";
  title: string;
  status: string;
  date: string;
  href: string;
}

interface DashboardData {
  studioCount: number;
  guardCount: number;
  credits: number;
  planTier: string;
  recentActivity: RecentActivity[];
}

function planLabel(tier: string): string {
  switch (tier) {
    case "studio_starter": return "Studio Starter";
    case "studio_reseller": return "Studio Reseller";
    case "guard_monthly": return "Guard Monthly";
    default: return "Free trial";
  }
}

function creditsBannerText(data: DashboardData): string {
  if (data.planTier !== "free") return `${planLabel(data.planTier)} plan active`;
  const remaining = Math.max(0, 3 - data.studioCount);
  return `Free trial — ${remaining} listing${remaining === 1 ? "" : "s"} remaining`;
}

function ActivityRow({ item }: { item: RecentActivity }) {
  const isStudio = item.type === "studio";
  return (
    <Link href={item.href}>
      <div className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer group">
        <span className="text-base shrink-0">{isStudio ? "📸" : "🛡️"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
            {item.title}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isStudio ? "Studio" : "Guard"} · {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
        </div>
        <Badge variant={isStudio ? "secondary" : "secondary"} className="shrink-0 text-xs">
          {item.status}
        </Badge>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard");
      if (r.status === 401) { setLoggedIn(false); return; }
      const d = await r.json() as DashboardData;
      setData(d);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    const onVisible = () => { if (document.visibilityState === "visible") void fetchDashboard(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchDashboard]);

  const planBadge = data ? planLabel(data.planTier) : "Free trial";
  const isUpgradeable = !data || data.planTier === "free";

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Welcome to ListLens. Start listing or checking listings below.</p>
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse" />
          ) : (
            <Badge variant={data?.planTier !== "free" ? "success" : "secondary"}>{planBadge}</Badge>
          )}
        </div>

        {/* Stats row */}
        {!loading && data && (
          <div className="grid grid-cols-3 gap-4">
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{data.studioCount}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Studio listings</p>
            </div>
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{data.guardCount}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Guard checks</p>
            </div>
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-bold text-violet-400">{data.credits}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Guard credits</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="brand-card p-4 text-center animate-pulse">
                <div className="h-8 w-12 bg-zinc-800 rounded mx-auto mb-1" />
                <div className="h-3 w-20 bg-zinc-800 rounded mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Quick action grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="brand-card p-5 transition-all cursor-pointer group hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.6)] hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-lg mb-3`}>
                  {link.icon}
                </div>
                <p className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">{link.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity + panels row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Studio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">📸</span> Studio
                {!loading && data && data.studioCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{data.studioCount}</Badge>
                )}
              </CardTitle>
              <Link href="/history">
                <span className="text-xs text-zinc-400 hover:text-white transition-colors">View all</span>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 space-y-2 animate-pulse">
                  {[0, 1].map((i) => <div key={i} className="h-10 bg-zinc-800 rounded" />)}
                </div>
              ) : data && data.recentActivity.filter((a) => a.type === "studio").length > 0 ? (
                <div className="divide-y divide-zinc-800/50">
                  {data.recentActivity.filter((a) => a.type === "studio").slice(0, 3).map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800 gap-3">
                  <p className="text-zinc-500 text-sm">No listings yet</p>
                  <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                    <Link href="/studio/new">Create first listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🛡️</span> Guard
                {!loading && data && data.guardCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{data.guardCount}</Badge>
                )}
              </CardTitle>
              <Link href="/history">
                <span className="text-xs text-zinc-400 hover:text-white transition-colors">View all</span>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 space-y-2 animate-pulse">
                  {[0, 1].map((i) => <div key={i} className="h-10 bg-zinc-800 rounded" />)}
                </div>
              ) : data && data.recentActivity.filter((a) => a.type === "guard").length > 0 ? (
                <div className="divide-y divide-zinc-800/50">
                  {data.recentActivity.filter((a) => a.type === "guard").slice(0, 3).map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800 gap-3">
                  <p className="text-zinc-500 text-sm">No checks yet</p>
                  <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-500">
                    <Link href="/guard/new">Check a listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credits / upgrade banner */}
        <Card className="border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 to-violet-950/30">
          <CardContent className="flex items-center justify-between flex-wrap gap-4 pt-6">
            <div>
              {loading ? (
                <>
                  <div className="h-5 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-3 w-72 bg-zinc-800 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-white font-semibold">{data ? creditsBannerText(data) : "Free trial"}</p>
                  <p className="text-zinc-400 text-sm mt-0.5">
                    {isUpgradeable
                      ? "Upgrade to Studio Starter for unlimited listings from £19.00/month"
                      : "Manage your subscription anytime in Billing & Plans."}
                  </p>
                </>
              )}
            </div>
            {!loggedIn ? (
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0">
                <a href="/api/auth/login">Log in to see your stats</a>
              </Button>
            ) : (
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0">
                <Link href="/billing">{isUpgradeable ? "Upgrade plan" : "Manage plan"}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
