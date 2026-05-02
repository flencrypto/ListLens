
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGuardCheck } from "@workspace/api-client-react";

const LENSES = [
  { id: "ShoeLens", icon: "👟", name: "ShoeLens" },
  { id: "LPLens", icon: "🎵", name: "LPLens" },
  { id: "ClothingLens", icon: "👕", name: "ClothingLens" },
  { id: "CardLens", icon: "🎴", name: "CardLens" },
  { id: "ToyLens", icon: "🧸", name: "ToyLens" },
  { id: "WatchLens", icon: "⌚", name: "WatchLens" },
  { id: "MotorLens", icon: "🚗", name: "MotorLens" },
  { id: "MeasureLens", icon: "📐", name: "MeasureLens" },
  { id: "TechLens", icon: "📱", name: "TechLens" },
  { id: "BookLens", icon: "📚", name: "BookLens" },
  { id: "AntiquesLens", icon: "🏺", name: "AntiquesLens" },
  { id: "AutographLens", icon: "✍️", name: "AutographLens" },
];

export default function NewGuardPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialLens = params.get("lens") ?? "ShoeLens";
  const [tab, setTab] = useState<"url" | "screenshots">("url");
  const [url, setUrl] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [lens, setLens] = useState(
    LENSES.some((l) => l.id === initialLens) ? initialLens : "ShoeLens"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createGuardCheck = useCreateGuardCheck();

  useEffect(() => {
    const lensParam = params.get("lens");
    if (lensParam && LENSES.some((l) => l.id === lensParam)) {
      setLens(lensParam);
    }
  }, [search]);

  function handleAddScreenshot() {
    const trimmed = screenshotInput.trim();
    if (!trimmed) return;
    if (screenshotUrls.includes(trimmed)) {
      setScreenshotInput("");
      return;
    }
    if (screenshotUrls.length >= 6) {
      setError("Maximum 6 screenshots allowed.");
      return;
    }
    setScreenshotUrls((prev) => [...prev, trimmed]);
    setScreenshotInput("");
    setError(null);
  }

  async function handleStart() {
    const hasInput = tab === "url" ? url.trim() : screenshotUrls.length > 0;
    if (!hasInput) {
      setError(tab === "url" ? "Enter a listing URL." : "Add at least one screenshot URL.");
      return;
    }
    setError(null);
    setLoading(true);
    let navigated = false;
    try {
      const data = await createGuardCheck.mutateAsync({
        data: {
          url: tab === "url" ? url.trim() : undefined,
          screenshotUrls: tab === "screenshots" ? screenshotUrls : undefined,
          lens,
        },
      });
      navigated = true;
      setLocation(`/guard/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-violet-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Guard · New check
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Guard — Check a Listing</h1>
          <p className="text-zinc-400 text-sm">AI risk report before you buy. Paste a URL or upload screenshots.</p>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        {/* Input method tabs */}
        <div className="brand-card p-5 mb-4">
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden w-fit mb-5">
            <button
              onClick={() => setTab("url")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "url" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              🔗 Listing URL
            </button>
            <button
              onClick={() => setTab("screenshots")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "screenshots" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              🖼 Screenshots
            </button>
          </div>

          {tab === "url" && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-sm">Paste an eBay or Vinted listing URL</p>
              <Input
                placeholder="https://www.ebay.co.uk/itm/... or https://www.vinted.co.uk/items/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="bg-zinc-900 border-zinc-700 focus:border-violet-600"
              />
            </div>
          )}

          {tab === "screenshots" && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-sm">Paste screenshot image URLs (up to 6)</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-600"
                  placeholder="https://example.com/screenshot.jpg"
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddScreenshot()}
                />
                <Button onClick={handleAddScreenshot} variant="secondary" size="sm">Add</Button>
              </div>
              {screenshotUrls.length > 0 && (
                <div className="space-y-1">
                  {screenshotUrls.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 rounded-lg border border-violet-900/30 bg-zinc-900/60 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.06)]">
                      <span className="text-zinc-600 w-4">{i + 1}</span>
                      <span className="truncate flex-1">{u}</span>
                      <button onClick={() => setScreenshotUrls((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lens picker */}
        <div className="brand-card brand-card-violet p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">Choose Lens</h2>
          <div className="grid grid-cols-3 gap-2">
            {LENSES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLens(l.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  lens === l.id
                    ? "border-violet-500 bg-violet-950/40"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <div className="text-xl mb-1">{l.icon}</div>
                <div className="font-medium text-xs text-white leading-tight">{l.name}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0"
        >
          {loading ? "Starting check…" : "Run Guard Check →"}
        </Button>

        <p className="text-center text-xs text-zinc-600 mt-4">
          This is an AI-assisted risk screen, not formal authentication.
        </p>
      </main>
    </div>
  );
}
