"use client";
import { useState, use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingEditor } from "@/components/studio/listing-editor";
import type { StudioOutput } from "@/lib/ai/schemas";

export default function StudioItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<StudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    setPhotoUrls((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  }

  async function handleAnalyse() {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${id}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white">Studio — Item {id}</h1>

        <Card>
          <CardHeader><CardTitle>Add Photos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500"
                placeholder="Paste photo URL…"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button onClick={handleAddUrl} variant="secondary" size="sm">Add</Button>
            </div>
            {photoUrls.length > 0 && (
              <ul className="space-y-1">
                {photoUrls.map((u, i) => (
                  <li key={i} className="text-zinc-400 text-xs truncate">• {u}</li>
                ))}
              </ul>
            )}
            <Button onClick={handleAnalyse} disabled={loading || photoUrls.length === 0}>
              {loading ? "Analysing…" : "Analyse with AI"}
            </Button>
          </CardContent>
        </Card>

        {analysis && <ListingEditor itemId={id} analysis={analysis} />}
      </main>
    </div>
  );
}
