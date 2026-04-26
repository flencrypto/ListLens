"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/pricing";
import type { StudioOutput } from "@/lib/ai/schemas";

interface ListingEditorProps {
  itemId: string;
  analysis: StudioOutput;
}

export function ListingEditor({ itemId, analysis }: ListingEditorProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  async function handleVintedExport() {
    setExporting(true);
    try {
      await fetch(`/api/items/${itemId}/export/vinted`, { method: "POST" });
      setExported(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Identity
            <Badge variant="success">{Math.round(analysis.identity.confidence * 100)}% confidence</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300">
            {analysis.identity.brand} {analysis.identity.model}
          </p>
          {analysis.warnings.map((w, i) => (
            <p key={i} className="text-amber-400 text-sm mt-1">⚠ {w}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-zinc-500 text-xs mb-1">Quick Sale</p>
              <p className="text-xl font-bold">{formatPrice(analysis.pricing.quick_sale, analysis.pricing.currency)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-1">Recommended</p>
              <p className="text-xl font-bold text-emerald-400">{formatPrice(analysis.pricing.recommended, analysis.pricing.currency)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-1">High</p>
              <p className="text-xl font-bold">{formatPrice(analysis.pricing.high, analysis.pricing.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis.missing_photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {analysis.missing_photos.map((p, i) => (
                <li key={i} className="text-zinc-400 text-sm">• {p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleVintedExport} disabled={exporting || exported} variant="secondary">
          {exported ? "Exported to Vinted" : exporting ? "Exporting…" : "Export to Vinted CSV"}
        </Button>
        <Button variant="outline" disabled>
          Publish to eBay (sandbox)
        </Button>
      </div>
    </div>
  );
}
