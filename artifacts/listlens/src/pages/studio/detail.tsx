
import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ListingEditor } from "@/components/studio/listing-editor";
import type { StudioOutput } from "@/lib/ai/schemas";

export default function StudioItemPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [analysis, setAnalysis] = useState<StudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/items/${id}/analysis`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.analysis) setAnalysis(data.analysis as StudioOutput);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [id]);

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed || photoUrls.includes(trimmed)) return;
    if (photoUrls.length >= 8) {
      setError("Maximum 8 photos allowed.");
      return;
    }
    setPhotoUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setError(null);
  }

  function handleRemoveUrl(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleAnalyse() {
    if (photoUrls.length === 0) {
      setError("Add at least one photo URL to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${id}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls, hint: hint.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
              Studio · Analysis
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">Studio</h1>
            <div className="hud-divider mt-2 max-w-[120px]" />
          </div>
          <Badge variant="secondary">Item {id.slice(-8)}</Badge>
        </div>

        {loadingExisting && (
          <div className="flex justify-center py-16">
            <Spinner className="text-cyan-400" />
          </div>
        )}

        {!loadingExisting && !analysis && (
          <>
            {/* Photo input */}
            <div className="brand-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Add Photos</h2>
                <span className="text-xs font-normal text-zinc-400">{photoUrls.length}/8 photos</span>
              </div>
              <p className="text-zinc-500 text-sm">
                Paste image URLs (JPG, PNG, WebP). Upload 3–8 photos for best results.
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                />
                <Button onClick={handleAddUrl} variant="secondary" size="sm">Add</Button>
              </div>

              {photoUrls.length > 0 && (
                <div className="space-y-2">
                  {photoUrls.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-cyan-900/30 bg-zinc-900/60 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
                      <span className="text-xs text-zinc-500 w-5 shrink-0">{i + 1}</span>
                      <span className="text-zinc-300 text-xs truncate flex-1">{u}</span>
                      <button
                        onClick={() => handleRemoveUrl(u)}
                        className="text-zinc-600 hover:text-red-400 text-xs shrink-0 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Hint */}
            <div className="brand-card p-6">
              <h2 className="text-base font-semibold text-white mb-3">
                Optional Hint{" "}
                <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </h2>
              <textarea
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 resize-none"
                rows={3}
                placeholder="e.g. 'Nike Air Max 90 size UK 10, bought 2022, worn maybe 5 times' — helps the AI identify your item faster"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAnalyse}
              disabled={loading || photoUrls.length === 0}
              className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-base text-cyan-300" /> Analysing…
                </span>
              ) : (
                "Analyse with AI →"
              )}
            </Button>
          </>
        )}

        {analysis && <ListingEditor itemId={id} analysis={analysis} onReset={() => setAnalysis(null)} />}
      </main>
    </div>
  );
}
