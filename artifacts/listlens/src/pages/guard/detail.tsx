
import { useState, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { RiskReport } from "@/components/guard/risk-report";
import { AnalysisReveal } from "@/components/ui/analysis-reveal";
import type { GuardOutput } from "@/lib/ai/schemas";
import { useAnalyseGuardCheck } from "@workspace/api-client-react";

export default function GuardCheckPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [report, setReport] = useState<GuardOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const analyseGuardCheck = useAnalyseGuardCheck();

  useEffect(() => {
    let cancelled = false;
    async function fetchExistingReport() {
      try {
        const res = await fetch(`/api/guard/checks/${id}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.report) {
            setReport(data.report as GuardOutput);
            setSaved(true);
            setRevealed(true);
          }
        }
      } catch {
        // silently ignore — user can still run a fresh analysis
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    fetchExistingReport();
    return () => { cancelled = true; };
  }, [id]);

  async function handleAnalyse() {
    setError(null);
    setLoading(true);
    try {
      const data = await analyseGuardCheck.mutateAsync({ id });
      setReport(data.report as GuardOutput);
      setShowReveal(true);
      setRevealed(false);
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

  const handleRevealDone = useCallback(() => {
    setShowReveal(false);
    setRevealed(true);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {showReveal && (
        <AnalysisReveal variant="guard" onDone={handleRevealDone} />
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-white">Guard Report</h1>
          <Badge variant="secondary">Check {id.slice(-8)}</Badge>
        </div>

        {initialLoading && (
          <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
            <Spinner className="text-base text-violet-400" />
            Loading report…
          </div>
        )}

        {!initialLoading && !report && (
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
                    <Spinner className="text-base text-violet-300" /> Analysing…
                  </span>
                ) : (
                  "Run Guard Analysis →"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {report && revealed && (
          <div className="reveal-stagger space-y-5">
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
          </div>
        )}
      </main>
    </div>
  );
}
