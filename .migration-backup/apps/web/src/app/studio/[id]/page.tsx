"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingEditor } from "@/components/studio/listing-editor";
import type { StudioOutput } from "@/lib/ai/schemas";

export default function StudioItemPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [analysis, setAnalysis] = useState<StudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Studio</h1>
          <Badge variant="secondary">Item {id.slice(-8)}</Badge>
        </div>

        {!analysis && (
          <>
            {/* Photo input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Add Photos</span>
                  <span className="text-xs font-normal text-zinc-400">{photoUrls.length}/8 photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
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
              </CardContent>
            </Card>

            {/* Hint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optional Hint <span className="text-zinc-500 font-normal text-xs">(optional)</span></CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 resize-none"
                  rows={3}
                  placeholder="e.g. 'Nike Air Max 90 size UK 10, bought 2022, worn maybe 5 times' — helps the AI identify your item faster"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyse}
              disabled={loading || photoUrls.length === 0}
              className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span> Analysing…
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
