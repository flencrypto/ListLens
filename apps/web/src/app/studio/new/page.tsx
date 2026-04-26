"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LENSES = [
  { id: "ShoeLens", icon: "👟", name: "ShoeLens", desc: "Trainers, sneakers, shoes" },
  { id: "LPLens", icon: "🎵", name: "LPLens", desc: "Vinyl, CDs, cassettes" },
] as const;

const MARKETPLACES = [
  { id: "both", label: "eBay + Vinted" },
  { id: "ebay", label: "eBay only" },
  { id: "vinted", label: "Vinted only" },
] as const;

export default function NewStudioPage() {
  const router = useRouter();
  const [selectedLens, setSelectedLens] = useState<string>("ShoeLens");
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("both");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lens: selectedLens, marketplace: selectedMarketplace }),
    });
    const data = await res.json();
    router.push(`/studio/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">New Listing</h1>
          <p className="text-zinc-400 text-sm">Choose your lens and marketplace, then upload photos.</p>
        </div>

        {/* Lens picker */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Choose Lens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {LENSES.map((lens) => (
                <button
                  key={lens.id}
                  onClick={() => setSelectedLens(lens.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedLens === lens.id
                      ? "border-cyan-500 bg-cyan-950/40"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{lens.icon}</div>
                  <div className="font-semibold text-sm text-white">{lens.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{lens.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketplace picker */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {MARKETPLACES.map((mp) => (
                <button
                  key={mp.id}
                  onClick={() => setSelectedMarketplace(mp.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedMarketplace === mp.id
                      ? "border-violet-500 bg-violet-950/40 text-violet-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {mp.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 h-12 text-base"
        >
          {loading ? "Creating listing…" : `Continue with ${selectedLens} →`}
        </Button>
      </main>
    </div>
  );
}
