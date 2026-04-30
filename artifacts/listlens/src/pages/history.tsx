import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
              Archive · v1.0
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">History</h1>
            <p className="text-zinc-400 text-sm">Your saved listings and Guard checks.</p>
            <div className="hud-divider mt-3 max-w-[160px]" />
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500">
              <Link href="/studio/new">New listing</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-violet-700 text-violet-300 hover:bg-violet-950/40">
              <Link href="/guard/new">New check</Link>
            </Button>
          </div>
        </div>

        {/* Listings section */}
        <div className="brand-card p-6">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📸</span> Studio Listings
            </h2>
            <Badge variant="secondary">0 listings</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-zinc-800 gap-3">
            <p className="text-zinc-500 text-sm">No listings yet.</p>
            <p className="text-zinc-600 text-xs max-w-xs text-center">
              Create a listing in Studio. After analysis, your drafts will appear here.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/studio/new">Create first listing</Link>
            </Button>
          </div>
        </div>

        <div className="hud-divider opacity-40" />

        {/* Guard checks section */}
        <div className="brand-card brand-card-violet p-6">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🛡️</span> Guard Checks
            </h2>
            <Badge variant="secondary">0 checks</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-zinc-800 gap-3">
            <p className="text-zinc-500 text-sm">No Guard checks yet.</p>
            <p className="text-zinc-600 text-xs max-w-xs text-center">
              Check a listing before you buy. Saved reports will appear here.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/guard/new">Check a listing</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
