"use client";
import { useState, use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskReport } from "@/components/guard/risk-report";
import type { GuardOutput } from "@/lib/ai/schemas";

export default function GuardCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<GuardOutput | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyse() {
    setLoading(true);
    try {
      const res = await fetch(`/api/guard/checks/${id}/analyse`, { method: "POST" });
      const data = await res.json();
      setReport(data.report);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white">Guard — Check {id}</h1>
        {!report && (
          <Card>
            <CardHeader><CardTitle>Run Analysis</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={handleAnalyse} disabled={loading}>
                {loading ? "Analysing…" : "Run Guard Analysis"}
              </Button>
            </CardContent>
          </Card>
        )}
        {report && <RiskReport report={report} />}
      </main>
    </div>
  );
}
