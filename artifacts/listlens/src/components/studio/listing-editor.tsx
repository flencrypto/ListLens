
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/pricing";
import type { StudioOutput } from "@/lib/ai/schemas";
import { generateEbayHtml } from "@/lib/ebay-html";

const LENS_FIELD_LABELS: Record<string, Record<string, string>> = {
  ClothingLens: {
    brand: "Brand",
    size_label: "Size Label",
    chest_cm: "Chest (cm)",
    waist_cm: "Waist (cm)",
    length_cm: "Length (cm)",
    material: "Material",
    colour: "Colour",
    style: "Style",
    era_vintage: "Era / Vintage",
    condition_tags: "Condition Tags",
    pilling: "Pilling",
    fading: "Fading",
    staining: "Staining",
  },
  CardLens: {
    card_name: "Card Name",
    set_name: "Set",
    set_number: "Set Number",
    rarity: "Rarity",
    language: "Language",
    edition: "Edition",
    grade: "Grade",
    grading_company: "Grading Company",
    centering: "Centering",
    surface_condition: "Surface",
    corner_condition: "Corners",
    holo_pattern: "Holo Pattern",
  },
  ToyLens: {
    brand: "Brand",
    product_name: "Product Name",
    year: "Year",
    completeness: "Completeness",
    packaging: "Packaging",
    parts_present: "Parts Present",
    parts_missing: "Parts Missing",
    reproduction_risk_notes: "Reproduction Risk",
    play_wear_notes: "Play Wear",
  },
  WatchLens: {
    brand: "Brand",
    model_reference: "Model Reference",
    movement_type: "Movement",
    case_material: "Case Material",
    dial_colour: "Dial Colour",
    bezel_type: "Bezel",
    bracelet_type: "Bracelet",
    case_diameter_mm: "Case Diameter (mm)",
    lug_width_mm: "Lug Width (mm)",
    year_approx: "Year (approx.)",
    serial_number_visible: "Serial Visible",
    service_history: "Service History",
    box_papers: "Box & Papers",
    condition_notes: "Condition Notes",
  },
  MeasureLens: {
    item_type: "Item Type",
    length_cm: "Length (cm)",
    width_cm: "Width (cm)",
    height_cm: "Height (cm)",
    depth_cm: "Depth (cm)",
    measurement_method: "Measurement Method",
    reference_object_used: "Reference Object",
    fit_notes: "Fit Notes",
    size_label: "Size Label",
    measurement_confidence: "Confidence",
  },
  MotorLens: {
    make: "Make",
    model: "Model",
    year: "Year",
    part_name: "Part Name",
    part_number: "Part Number",
    oem_or_aftermarket: "OEM / Aftermarket",
    fitment_vehicles: "Fits Vehicles",
    condition_notes: "Condition",
    mileage: "Mileage",
    service_history_present: "Service History",
    colour: "Colour",
  },
  TechLens: {
    brand: "Brand",
    model: "Model",
    variant: "Variant",
    storage_or_spec: "Storage / Spec",
    model_number: "Model Number",
    condition: "Condition",
    screen_damage: "Screen Damage",
    body_damage: "Body Damage",
    ports_condition: "Ports",
    battery_health: "Battery Health",
    included_accessories: "Accessories",
    tested_or_untested: "Tested",
    fault_notes: "Fault Notes",
    activation_lock_status: "Activation Lock",
    network_lock_status: "Network Lock",
  },
  BookLens: {
    title: "Title",
    author: "Author",
    publisher: "Publisher",
    year: "Year",
    edition: "Edition",
    isbn: "ISBN",
    format: "Format",
    dust_jacket_present: "Dust Jacket",
    dust_jacket_condition: "Dust Jacket Condition",
    printing_statement: "Printing Statement",
    spine_condition: "Spine",
    boards_condition: "Boards",
    pages_condition: "Pages",
    foxing: "Foxing",
    annotations: "Annotations",
    signatures: "Signatures",
    completeness: "Completeness",
  },
  AntiquesLens: {
    object_type: "Object Type",
    material: "Material",
    era_or_style: "Era / Style",
    maker_marks: "Maker Marks",
    dimensions: "Dimensions",
    chips_or_cracks_or_repairs: "Chips / Cracks / Repairs",
    patina: "Patina",
    missing_parts: "Missing Parts",
    provenance: "Provenance",
    estimated_price_range: "Est. Price Range",
  },
  AutographLens: {
    signed_item_type: "Signed Item",
    claimed_signer: "Claimed Signer",
    signature_location: "Signature Location",
    ink_visibility: "Ink Visibility",
    certificate_or_provenance_present: "Certificate / Provenance",
    coa_issuer: "COA Issuer",
    event_or_source_notes: "Event / Source",
    item_condition: "Item Condition",
  },
};

function formatAttrValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    const items = value.filter(Boolean).map(String);
    return items.length > 0 ? items.join(", ") : null;
  }
  return null;
}

function LensAttributesPanel({ lens, attributes }: { lens: string; attributes: Record<string, unknown> }) {
  const fieldLabels = LENS_FIELD_LABELS[lens];
  if (!fieldLabels) return null;

  const rows: { label: string; value: string }[] = [];
  for (const [key, label] of Object.entries(fieldLabels)) {
    const raw = attributes[key];
    const formatted = formatAttrValue(raw);
    if (formatted) rows.push({ label, value: formatted });
  }
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>Item Details</span>
          <Badge variant="secondary" className="text-xs">{lens}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 min-w-0">
              <dt className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</dt>
              <dd className="text-sm text-zinc-200 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
interface ListingEditorProps {
  itemId: string;
  analysis: StudioOutput;
  onReset?: () => void;
}

function getInitialTitle(ebay: Record<string, unknown>, analysis: StudioOutput): string {
  if (typeof ebay.title === "string" && ebay.title) return ebay.title;
  return `${analysis.identity.brand ?? ""} ${analysis.identity.model ?? ""}`.trim();
}

export function ListingEditor({ itemId, analysis, onReset }: ListingEditorProps) {
  const ebay = analysis.marketplace_outputs.ebay;
  const vinted = analysis.marketplace_outputs.vinted;

  const [title, setTitle] = useState<string>(() => getInitialTitle(ebay, analysis));
  const [description, setDescription] = useState<string>(
    analysis.listing_description ||
    (ebay.description as string | undefined) ||
    ""
  );
  const [price, setPrice] = useState<number>(analysis.pricing.recommended);

  const initialTitle = getInitialTitle(analysis.marketplace_outputs.ebay, analysis);
  const initialDescription = analysis.listing_description || (analysis.marketplace_outputs.ebay.description as string | undefined) || "";
  const initialPrice = analysis.pricing.recommended;

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<{ listingId: string; viewItemURL: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isDirty =
    title !== initialTitle || description !== initialDescription || price !== initialPrice;

  type EbaySettings = {
    shippingCost: string;
    returnsAccepted: boolean;
    returnPeriod: string;
    paymentMethod: string;
  };
  const [ebaySettings, setEbaySettings] = useState<EbaySettings | null>(null);
  const [ebaySettingsLoading, setEbaySettingsLoading] = useState(true);
  const [ebaySettingsError, setEbaySettingsError] = useState(false);

  useEffect(() => {
    fetch("/api/ebay/settings")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: unknown) => {
        if (data && typeof (data as Record<string, unknown>).shippingCost !== "undefined") {
          setEbaySettings(data as EbaySettings);
        } else {
          setEbaySettingsError(true);
        }
      })
      .catch(() => setEbaySettingsError(true))
      .finally(() => setEbaySettingsLoading(false));
  }, []);

  const needsConfirmation =
    analysis.identity.confidence < 0.7 || analysis.pricing.confidence < 0.6;

  const ebayHtml = generateEbayHtml(analysis, title, description, price);

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? `Save failed (${res.status})`);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed.");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleVintedExport() {
    setActionError(null);
    setExporting(true);
    try {
      const res = await fetch(`/api/items/${itemId}/export/vinted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? `Vinted export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vinted-${itemId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Vinted export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleEbayPublish() {
    if (needsConfirmation) {
      const ok = window.confirm(
        "Confidence is below recommended threshold. Are you sure you want to create an eBay draft?"
      );
      if (!ok) return;
    }
    setActionError(null);
    setPublishing(true);
    try {
      const res = await fetch(`/api/items/${itemId}/publish/ebay-sandbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price, lens: analysis.lens }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? `eBay draft failed (${res.status})`);
      }
      const data = await res.json() as { listingId: string; viewItemURL: string };
      setPublished({ listingId: data.listingId, viewItemURL: data.viewItemURL });
      window.open(data.viewItemURL, "_blank", "noopener,noreferrer");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "eBay draft failed.");
    } finally {
      setPublishing(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleCopyHtml() {
    navigator.clipboard.writeText(ebayHtml);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2500);
  }

  const confidenceColor =
    analysis.identity.confidence >= 0.8
      ? "success"
      : analysis.identity.confidence >= 0.6
        ? "warning"
        : "destructive";

  function formatReturnPeriod(period: string): string {
    const map: Record<string, string> = {
      Days_14: "14 days",
      Days_30: "30 days",
      Days_60: "60 days",
    };
    return map[period] ?? period;
  }

  function formatShippingCost(cost: string): string {
    const val = parseFloat(cost);
    if (isNaN(val)) return "—";
    return val === 0 ? "Free" : `£${val.toFixed(2)}`;
  }

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

      {/* Category-specific attributes */}
      {Object.keys(analysis.attributes ?? {}).length > 0 && (
        <LensAttributesPanel
          lens={analysis.lens}
          attributes={analysis.attributes as Record<string, unknown>}
        />
      )}

      {/* Save bar */}
      {(isDirty || saveStatus !== "idle") && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-800/40 bg-cyan-950/20 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {saveStatus === "saved" ? (
              <span className="text-emerald-400 text-sm font-medium">✓ Changes saved</span>
            ) : saveStatus === "error" ? (
              <span className="text-red-400 text-sm truncate">{saveError ?? "Save failed"}</span>
            ) : (
              <span className="text-cyan-300 text-sm">Unsaved changes</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 shrink-0"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Spinner className="text-cyan-200 text-xs" /> Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      )}

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
          {/* Sneaker market price data row */}
          {analysis.sneaker_market?.price_median_gbp != null && (
            <div className="flex items-center justify-between rounded-lg border border-blue-900/40 bg-blue-950/20 px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-blue-400 font-medium uppercase tracking-wide">Market price</span>
                <span className="text-lg font-bold text-blue-300">
                  {formatPrice(analysis.sneaker_market.price_median_gbp, "GBP")} median
                </span>
                {analysis.sneaker_market.price_min_gbp != null && analysis.sneaker_market.price_max_gbp != null && (
                  <span className="text-xs text-blue-500">
                    Range: {formatPrice(analysis.sneaker_market.price_min_gbp, "GBP")} – {formatPrice(analysis.sneaker_market.price_max_gbp, "GBP")}
                    {" "}({analysis.sneaker_market.source_listings} listings)
                  </span>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-800/50 bg-blue-950/40 px-2 py-0.5 text-xs text-blue-400">
                  via Real-Time Sneaker Prices
                </span>
              </div>
            </div>
          )}
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

      {/* Action error display */}
      {actionError && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          ⚠ {actionError}
        </div>
      )}

      {/* eBay HTML Listing — primary export */}
      <Card className="border-orange-900/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2 text-base">
            <span className="flex items-center gap-2">
              <span className="text-orange-400">eBay Listing HTML</span>
              <Badge variant="secondary" className="text-xs">paste into eBay description</Badge>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHtmlPreviewOpen((v) => !v)}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
              >
                {htmlPreviewOpen ? "Hide preview" : "Show preview"}
              </button>
              <Button
                size="sm"
                onClick={handleCopyHtml}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs h-7 px-3"
              >
                {htmlCopied ? "✓ Copied!" : "Copy HTML"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-zinc-400 text-sm">
            Copy the HTML below and paste it into eBay's <strong className="text-zinc-300">custom description editor</strong> when creating your listing.
          </p>

          {/* Preview */}
          {htmlPreviewOpen && (
            <div className="rounded-lg border border-zinc-700 overflow-hidden">
              <div className="bg-zinc-800 px-3 py-1.5 flex items-center gap-2 border-b border-zinc-700">
                <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/70 inline-block" />
                <span className="ml-2 text-xs text-zinc-500">Preview — how it looks on eBay</span>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={ebayHtml}
                className="w-full bg-white"
                style={{ height: "360px", border: "none" }}
                sandbox="allow-same-origin"
                title="eBay listing HTML preview"
              />
            </div>
          )}

          {/* HTML code block */}
          <div className="relative">
            <pre className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400 overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap break-all font-mono">
              {ebayHtml}
            </pre>
            <button
              onClick={handleCopyHtml}
              className="absolute top-2 right-2 text-xs text-zinc-500 hover:text-zinc-200 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 transition-colors"
            >
              {htmlCopied ? "✓" : "Copy"}
            </button>
          </div>

          <p className="text-zinc-500 text-xs">
            On eBay: Create listing → Scroll to Description → click <strong className="text-zinc-400">HTML</strong> → paste this code.
          </p>
        </CardContent>
      </Card>

      {/* eBay API Draft (optional — requires eBay account connection) */}
      <Card>
        <CardHeader><CardTitle className="text-base">eBay API Draft</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-zinc-400 text-sm">
            Optionally create a draft listing directly via the eBay API.
            {" "}<a href="/billing?tab=ebay" className="text-cyan-500 underline hover:text-cyan-400 text-xs">Connect your eBay account →</a>
          </p>

          {/* Listing defaults preview */}
          {ebaySettingsLoading ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500 animate-pulse">
              Loading listing defaults…
            </div>
          ) : ebaySettings ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 space-y-2">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Listing defaults</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Shipping</p>
                  <p className="text-sm font-semibold text-zinc-200">{formatShippingCost(ebaySettings.shippingCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Returns</p>
                  <p className="text-sm font-semibold text-zinc-200">
                    {ebaySettings.returnsAccepted ? formatReturnPeriod(ebaySettings.returnPeriod) : "No returns"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Payment</p>
                  <p className="text-sm font-semibold text-zinc-200">{ebaySettings.paymentMethod}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 text-right">
                <a href="/billing?tab=ebay" className="text-cyan-600 hover:text-cyan-400 underline underline-offset-2 transition-colors">
                  Update settings →
                </a>
              </p>
            </div>
          ) : ebaySettingsError ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
              Could not load listing defaults.{" "}
              <a href="/billing?tab=ebay" className="text-cyan-600 hover:text-cyan-400 underline underline-offset-2 transition-colors">
                Check eBay settings →
              </a>
            </div>
          ) : null}

          {published ? (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 space-y-1">
              <p className="text-emerald-400 text-sm font-medium">✓ Draft created</p>
              <p className="text-zinc-400 text-xs">Listing ID: {published.listingId}</p>
              <a
                href={published.viewItemURL}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-500 text-xs underline hover:text-cyan-400"
              >
                View on eBay →
              </a>
            </div>
          ) : (
            <Button onClick={handleEbayPublish} disabled={publishing} variant="outline" className="w-full">
              {publishing ? "Creating draft…" : "Create eBay Draft"}
            </Button>
          )}
        </CardContent>
      </Card>

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
