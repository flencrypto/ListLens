"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  RecordReleaseIdentification,
} from "@/lib/ai/schemas";

/**
 * RecordLens — single-label-photo release identification with optional
 * matrix/runout clarification follow-up. Returns a ranked list of likely
 * pressings rather than a single overconfident answer.
 */

type IdentifyResult = RecordReleaseIdentification;

export default function RecordLensIdentifyPage() {
  const [labelUrls, setLabelUrls] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [matrixA, setMatrixA] = useState("");
  const [matrixB, setMatrixB] = useState("");
  const [extraSymbols, setExtraSymbols] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);

  function parseUrls(): string[] {
    return labelUrls
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
  }

  async function runIdentify() {
    setError(null);
    const urls = parseUrls();
    if (urls.length === 0) {
      setError("Add at least one label photo URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lenses/record/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelPhotoUrls: urls, hint: hint || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? "Identification failed");
      }
      const data = (await res.json()) as { analysis: IdentifyResult };
      setResult(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identification failed");
    } finally {
      setLoading(false);
    }
  }

  async function runWithMatrix() {
    setError(null);
    const urls = parseUrls();
    if (urls.length === 0) {
      setError("Add at least one label photo URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lenses/record/identify-with-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labelPhotoUrls: urls,
          hint: hint || undefined,
          matrix: {
            side_a: matrixA || undefined,
            side_b: matrixB || undefined,
            extra_symbols: extraSymbols || undefined,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? "Identification failed");
      }
      const data = (await res.json()) as { analysis: IdentifyResult };
      setResult(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💿</span>
            <div>
              <h1 className="text-2xl font-bold text-white">RecordLens · Label Identify</h1>
              <p className="text-zinc-400 text-sm">
                Paste label photo URL(s) to get ranked likely releases. Add matrix runout details
                to clarify the pressing.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Label photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label htmlFor="label-urls" className="block text-xs text-zinc-400 mb-1">
              Photo URL(s) — comma or whitespace separated
            </label>
            <Input
              id="label-urls"
              value={labelUrls}
              onChange={(e) => setLabelUrls(e.target.value)}
              placeholder="https://example.com/label-side-a.jpg"
            />
            <label htmlFor="seller-hint" className="block text-xs text-zinc-400 mb-1">
              Optional seller hint
            </label>
            <Input
              id="seller-hint"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. Radiohead OK Computer, UK pressing"
            />
            <Button
              onClick={runIdentify}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              {loading ? "Analysing…" : "Identify from label"}
            </Button>
          </CardContent>
        </Card>

        {result?.needs_matrix_for_clarification && (
          <Card className="border-amber-900/40">
            <CardHeader>
              <CardTitle className="text-base">Matrix / runout clarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.matrix_clarification_questions.length > 0 && (
                <ul className="text-sm text-zinc-400 list-disc pl-5">
                  {result.matrix_clarification_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              )}
              <label htmlFor="matrix-side-a" className="block text-xs text-zinc-400 mt-2 mb-1">
                Side A matrix runout
              </label>
              <Input
                id="matrix-side-a"
                value={matrixA}
                onChange={(e) => setMatrixA(e.target.value)}
              />
              <label htmlFor="matrix-side-b" className="block text-xs text-zinc-400 mb-1">
                Side B matrix runout
              </label>
              <Input
                id="matrix-side-b"
                value={matrixB}
                onChange={(e) => setMatrixB(e.target.value)}
              />
              <label htmlFor="matrix-extra-symbols" className="block text-xs text-zinc-400 mb-1">
                Extra symbols / initials
              </label>
              <Input
                id="matrix-extra-symbols"
                value={extraSymbols}
                onChange={(e) => setExtraSymbols(e.target.value)}
              />
              <Button
                onClick={runWithMatrix}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-500"
              >
                {loading ? "Re-ranking…" : "Re-rank with matrix"}
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-900/40">
            <CardContent className="text-red-400 text-sm pt-6">{error}</CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Card className="border-cyan-900/40">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Top match
                  <Badge className="bg-cyan-900/40 text-cyan-300 border-cyan-800">
                    {result.top_match.likelihood_percent}% likely
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-white font-semibold">{result.top_match.likely_release}</p>
                <p className="text-sm text-zinc-400">
                  {[result.top_match.artist, result.top_match.title]
                    .filter(Boolean)
                    .join(" — ") || "Artist/title not yet identified"}
                </p>
                {(result.top_match.label || result.top_match.catalogue_number) && (
                  <p className="text-xs text-zinc-500">
                    {[result.top_match.label, result.top_match.catalogue_number]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {result.top_match.evidence.length > 0 && (
                  <ul className="text-xs text-zinc-400 list-disc pl-5 mt-2">
                    {result.top_match.evidence.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {result.alternate_matches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alternate matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.alternate_matches.map((m, i) => (
                    <div key={i} className="border-t border-zinc-800 pt-2 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white">{m.likely_release}</p>
                        <Badge variant="secondary">{m.likelihood_percent}%</Badge>
                      </div>
                      {m.evidence.length > 0 && (
                        <ul className="text-xs text-zinc-500 list-disc pl-5 mt-1">
                          {m.evidence.map((e, j) => (
                            <li key={j}>{e}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {result.warnings.length > 0 && (
              <Card className="border-amber-900/40">
                <CardHeader>
                  <CardTitle className="text-base">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-amber-300 list-disc pl-5">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-zinc-500 italic">{result.disclaimer}</p>
          </div>
        )}
      </main>
    </div>
  );
}
