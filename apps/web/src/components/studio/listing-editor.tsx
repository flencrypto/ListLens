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
  onReset?: () => void;
}

export function ListingEditor({ itemId, analysis, onReset }: ListingEditorProps) {
  const ebay = analysis.marketplace_outputs.ebay;
  const vinted = analysis.marketplace_outputs.vinted;

  const [title, setTitle] = useState<string>((ebay.title as string) ?? `${analysis.identity.brand ?? ""} ${analysis.identity.model ?? ""}`.trim());
  const [description, setDescription] = useState<string>((ebay.description as string) ?? "");
  const [price, setPrice] = useState<number>(analysis.pricing.recommended);

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const needsConfirmation =
    analysis.identity.confidence < 0.7 || analysis.pricing.confidence < 0.6;

  async function handleVintedExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/items/${itemId}/export/vinted`, { method: "POST" });
      if (res.ok) {
        // trigger CSV download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vinted-${itemId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExported(true);
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleEbayPublish() {
    if (needsConfirmation) {
      const ok = window.confirm(
        "Confidence is below recommended threshold. Are you sure you want to create an eBay sandbox draft?"
      );
      if (!ok) return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/items/${itemId}/publish/ebay-sandbox`, { method: "POST" });
      const data = await res.json();
      if (data.sandboxListingId) setPublished(data.sandboxListingId);
    } finally {
      setPublishing(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const confidenceColor =
    analysis.identity.confidence >= 0.8
      ? "success"
      : analysis.identity.confidence >= 0.6
        ? "warning"
        : "destructive";

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 flex-wrap">
            <span>Identity</span>
            <Badge variant={confidenceColor}>
              {Math.round(analysis.identity.confidence * 100)}% confidence
            </Badge>
            <Badge variant="secondary">{analysis.lens}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-zinc-300 font-medium">
            {analysis.identity.brand} {analysis.identity.model}
          </p>
          {analysis.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-amber-400 text-sm bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
              <span className="shrink-0">⚠</span>
              <span>{w}</span>
            </div>
          ))}
          {needsConfirmation && (
            <div className="text-amber-300 text-sm bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2">
              ⚠ Low confidence — review carefully before exporting.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable title */}
      <Card>
        <CardHeader><CardTitle className="text-base">Title</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{title.length}/80 characters</span>
            <button onClick={() => handleCopy(title, "title")} className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
              {copied === "title" ? "Copied!" : "Copy"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Editable description */}
      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <textarea
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 resize-none"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end">
            <button onClick={() => handleCopy(description, "desc")} className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
              {copied === "desc" ? "Copied!" : "Copy"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 flex-wrap text-base">
            Pricing
            <Badge variant={analysis.pricing.confidence >= 0.7 ? "success" : "warning"}>
              {Math.round(analysis.pricing.confidence * 100)}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">Quick Sale</p>
              <p className="text-xl font-bold text-zinc-300">{formatPrice(analysis.pricing.quick_sale, analysis.pricing.currency)}</p>
            </div>
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3 text-center">
              <p className="text-emerald-400 text-xs mb-1">Recommended ✓</p>
              <p className="text-xl font-bold text-emerald-400">{formatPrice(analysis.pricing.recommended, analysis.pricing.currency)}</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
              <p className="text-zinc-500 text-xs mb-1">High</p>
              <p className="text-xl font-bold text-zinc-300">{formatPrice(analysis.pricing.high, analysis.pricing.currency)}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Your price (£)</label>
            <input
              type="number"
              className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:border-cyan-600"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
            />
          </div>
        </CardContent>
      </Card>

      {/* Missing photos */}
      {analysis.missing_photos.length > 0 && (
        <Card className="border-amber-900/40">
          <CardHeader>
            <CardTitle className="text-base text-amber-400">⚠ Missing Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm mb-3">Add these photos to strengthen your listing:</p>
            <ul className="space-y-1">
              {analysis.missing_photos.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="text-amber-500">•</span> {p}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Vinted copy section */}
      <Card>
        <CardHeader><CardTitle className="text-base">Vinted Export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-zinc-400 text-sm">Vinted-ready title and description. Copy or export as CSV.</p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Title</p>
                <p className="text-sm text-zinc-300">{(vinted.title as string) ?? title}</p>
              </div>
              <button onClick={() => handleCopy((vinted.title as string) ?? title, "vtitle")} className="text-xs text-cyan-500 hover:text-cyan-400 shrink-0 transition-colors">
                {copied === "vtitle" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleVintedExport} disabled={exporting} variant="secondary" className="flex-1">
              {exported ? "✓ CSV downloaded" : exporting ? "Exporting…" : "Export Vinted CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* eBay sandbox */}
      <Card>
        <CardHeader><CardTitle className="text-base">eBay Draft</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-zinc-400 text-sm">Create a sandbox draft listing on eBay.</p>
          {published ? (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
              <p className="text-emerald-400 text-sm">✓ Sandbox draft created</p>
              <p className="text-zinc-400 text-xs mt-1">ID: {published}</p>
            </div>
          ) : (
            <Button onClick={handleEbayPublish} disabled={publishing} variant="outline" className="w-full">
              {publishing ? "Creating draft…" : "Create eBay Sandbox Draft"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Reset */}
      {onReset && (
        <div className="pt-2">
          <button onClick={onReset} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Start new analysis
          </button>
        </div>
      )}
    </div>
  );
}
