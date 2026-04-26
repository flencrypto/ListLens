"use client";
import { useState, use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskReport } from "@/components/guard/risk-report";
import type { GuardOutput } from "@/lib/ai/schemas";

export default function GuardCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<GuardOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleAnalyse() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/guard/checks/${id}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    await fetch(`/api/guard/checks/${id}/save`, { method: "POST" });
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-white">Guard Report</h1>
          <Badge variant="secondary">Check {id.slice(-8)}</Badge>
        </div>

        {!report && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ready to analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Click the button below to run the AI risk analysis on this listing.
              </p>
              {error && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              <Button
                onClick={handleAnalyse}
                disabled={loading}
                className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span> Analysing…
                  </span>
                ) : (
                  "Run Guard Analysis →"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {report && (
          <>
            <RiskReport report={report} />
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saved}
                variant="secondary"
                className="flex-1"
              >
                {saved ? "✓ Report saved" : "Save Report"}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1"
              >
                Print / PDF
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
