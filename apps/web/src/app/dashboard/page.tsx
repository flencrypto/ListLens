import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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

export default async function DashboardPage() {
  await auth();

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
          <Badge variant="secondary">Free trial</Badge>
        </div>

        {/* Quick action grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600 transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-lg mb-3`}>
                  {link.icon}
                </div>
                <p className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">{link.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main panels */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Studio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">📸</span> Studio
              </CardTitle>
              <Link href="/history">
                <span className="text-xs text-zinc-400 hover:text-white transition-colors">View all</span>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800 gap-3">
                <p className="text-zinc-500 text-sm">No listings yet</p>
                <Link href="/studio/new">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                    Create first listing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Guard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🛡️</span> Guard
              </CardTitle>
              <Link href="/history">
                <span className="text-xs text-zinc-400 hover:text-white transition-colors">View all</span>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800 gap-3">
                <p className="text-zinc-500 text-sm">No checks yet</p>
                <Link href="/guard/new">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
                    Check a listing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits banner */}
        <Card className="border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 to-violet-950/30">
          <CardContent className="flex items-center justify-between flex-wrap gap-4 pt-6">
            <div>
              <p className="text-white font-semibold">Free trial — 3 listings remaining</p>
              <p className="text-zinc-400 text-sm mt-0.5">Upgrade to Studio Starter for unlimited listings from £9.99/month</p>
            </div>
            <Link href="/billing">
              <Button className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0">
                Upgrade plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
