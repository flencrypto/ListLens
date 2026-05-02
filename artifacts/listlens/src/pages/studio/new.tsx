
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { useUpload } from "@workspace/object-storage-web";
import { useCreateStudioItem, useAnalyseStudioItem } from "@workspace/api-client-react";

const LENSES = [
  { id: "ShoeLens", icon: "👟", name: "ShoeLens", desc: "Trainers, sneakers, shoes" },
  { id: "RecordLens", icon: "💿", name: "RecordLens", desc: "Vinyl, CDs, cassettes" },
  { id: "ClothingLens", icon: "👕", name: "ClothingLens", desc: "Clothing & vintage garments" },
  { id: "CardLens", icon: "🎴", name: "CardLens", desc: "Trading cards & graded slabs" },
  { id: "ToyLens", icon: "🧸", name: "ToyLens", desc: "Toys, figures & LEGO" },
  { id: "WatchLens", icon: "⌚", name: "WatchLens", desc: "Watches & timepieces" },
  { id: "MotorLens", icon: "🚗", name: "MotorLens", desc: "Vehicles & motor parts" },
  { id: "MeasureLens", icon: "📐", name: "MeasureLens", desc: "Dimension estimation" },
  { id: "TechLens", icon: "📱", name: "TechLens", desc: "Phones, laptops, cameras" },
  { id: "BookLens", icon: "📚", name: "BookLens", desc: "Books & first editions" },
  { id: "AntiquesLens", icon: "🏺", name: "AntiquesLens", desc: "Antiques & decorative objects" },
  { id: "AutographLens", icon: "✍️", name: "AutographLens", desc: "Signed items & provenance" },
];

const LENS_UPLOAD_SHOTS: Record<string, string[]> = {
  ShoeLens: [
    "Lateral (outer) side of both shoes",
    "Medial (inner) side of both shoes",
    "Toe box — straight on",
    "Heel — straight on",
    "Sole / outsole (lay flat)",
    "Size tag on the tongue",
    "Close-up of any scuffs, creasing, or sole wear",
  ],
  RecordLens: [
    "Front sleeve",
    "Back sleeve",
    "Label on Side A",
    "Label on Side B",
    "Matrix / runout etching on Side A",
    "Matrix / runout etching on Side B",
    "Any sleeve damage, seam splits, or vinyl marks",
  ],
  ClothingLens: [
    "Front of the garment (laid flat or on hanger)",
    "Back of the garment",
    "Brand label",
    "Care / wash label",
    "Collar and cuffs",
    "Zip, buttons, or fastenings",
    "Close-up of any pilling, fading, or staining",
  ],
  CardLens: [
    "Card face — well lit, no glare",
    "Card reverse",
    "All four corners (close-up)",
    "Edges — top and bottom",
    "Surface under raking light to reveal surface wear",
    "Hologram, stamp, or authentication label if present",
  ],
  ToyLens: [
    "Front of item",
    "Back of item",
    "All loose accessories or parts",
    "Any play wear, paint loss, or damage",
    "Batch / serial number stamp (usually moulded into the base)",
    "Packaging or box, if present",
  ],
  WatchLens: [
    "Dial face — straight on, in good light",
    "Case side at the 3 o'clock position",
    "Crown (close-up)",
    "Caseback — engravings or serial number visible",
    "Bracelet or strap — top and underside",
    "Clasp",
    "Any scratches, blemishes, or polishing marks",
  ],
  MeasureLens: [
    "Item alongside your reference object — front view (keep the full reference visible)",
    "Item alongside your reference object — side view",
    "Item alongside your reference object — top / overhead view",
  ],
  MotorLens: [
    "Part number or casting stamp (close-up)",
    "Front face",
    "Rear face",
    "Mounting points or bolt holes",
    "Connector, port, or coupling (if applicable)",
    "Any corrosion, cracks, or damage",
  ],
  TechLens: [
    "Front / screen",
    "Back / chassis",
    "All ports and connectors",
    "Model and serial number label",
    "Any screen damage, scratches, or dents",
    "Accessories or cables included",
  ],
  BookLens: [
    "Front cover",
    "Back cover",
    "Spine",
    "Title page",
    "Copyright / colophon page",
    "Any foxing, inscriptions, or condition issues",
  ],
  AntiquesLens: [
    "Front face",
    "Back / underside",
    "All four sides",
    "Maker's mark, signature, or hallmark (close-up)",
    "Any damage, chips, or repairs",
    "Scale reference — item alongside a coin or ruler",
  ],
  AutographLens: [
    "The autograph — close-up, well lit",
    "Full item showing the autograph in context",
    "Certificate of authenticity or provenance document",
    "Any authentication hologram or stamp",
    "Back of item if relevant",
  ],
};

const WATCH_LOOKUP_REMINDER =
  "Tip: use the Reference Lookup panel above to search Chrono24 and auto-fill watch details before uploading.";

function LensGuidancePanel({
  lensId,
  hasPhotos,
}: {
  lensId: string;
  hasPhotos: boolean;
}) {
  const shots = LENS_UPLOAD_SHOTS[lensId];
  if (!shots) return null;

  const isWatch = lensId === "WatchLens";

  return (
    <div
      className={[
        "overflow-hidden transition-all duration-500 ease-in-out",
        hasPhotos ? "max-h-0 opacity-0 mb-0" : "max-h-[600px] opacity-100 mb-4",
      ].join(" ")}
    >
      <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 px-4 py-3">
        <p className="text-xs font-mono-hud tracking-[0.18em] uppercase text-cyan-400 mb-2">
          {lensId} · Suggested shots
        </p>
        <ul className="space-y-1.5">
          {shots.map((shot) => (
            <li key={shot} className="flex items-start gap-2 text-xs text-zinc-300">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/70" />
              Include a photo of the <span className="text-white">{shot}</span>
            </li>
          ))}
        </ul>
        {isWatch && (
          <p className="mt-3 text-xs text-cyan-300/70 border-t border-cyan-900/40 pt-2">
            {WATCH_LOOKUP_REMINDER}
          </p>
        )}
      </div>
    </div>
  );
}

const MARKETPLACES = [
  { id: "both", label: "eBay + Vinted" },
  { id: "ebay", label: "eBay only" },
  { id: "vinted", label: "Vinted only" },
] as const;

const MAX_PHOTOS = 8;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

interface WatchLookupResult {
  found: boolean;
  ref: string;
  brand?: string | null;
  model?: string | null;
  reference_number?: string | null;
  case_material?: string | null;
  price_min_gbp?: number | null;
  price_median_gbp?: number | null;
  price_max_gbp?: number | null;
  total_count?: number;
  search_query?: string;
}

function buildWatchHint(r: WatchLookupResult): string {
  const parts: string[] = [];
  if (r.brand) parts.push(`Brand: ${r.brand}`);
  if (r.model) parts.push(`Model: ${r.model}`);
  if (r.reference_number) parts.push(`Reference: ${r.reference_number}`);
  if (r.case_material) parts.push(`Case material: ${r.case_material}`);
  if (r.price_median_gbp != null) {
    parts.push(
      `Chrono24 market price: £${r.price_min_gbp ?? "?"}–£${r.price_max_gbp ?? "?"} (median £${r.price_median_gbp})`
    );
  }
  return parts.join(". ");
}

export default function NewStudioPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialLens = params.get("lens") ?? "ShoeLens";
  const [selectedLens, setSelectedLens] = useState<string>(
    LENSES.some((l) => l.id === initialLens) ? initialLens : "ShoeLens"
  );
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("both");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadLabel, setUploadLabel] = useState("");
  const [analysisLabel, setAnalysisLabel] = useState("");
  const [hint, setHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createStudioItem = useCreateStudioItem();
  const analyseStudioItem = useAnalyseStudioItem();

  const [refInput, setRefInput] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refResult, setRefResult] = useState<WatchLookupResult | null>(null);

  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onError: (err) => setError(`Upload failed: ${err.message}`),
  });

  useEffect(() => {
    const lensParam = params.get("lens");
    if (lensParam && LENSES.some((l) => l.id === lensParam)) {
      setSelectedLens(lensParam);
    }
  }, [search]);

  useEffect(() => {
    if (selectedLens !== "WatchLens") {
      setRefInput("");
      setRefResult(null);
      setRefError(null);
    }
  }, [selectedLens]);

  async function handleRefLookup() {
    const trimmed = refInput.trim();
    if (trimmed.length < 3) {
      setRefError("Enter at least 3 characters.");
      return;
    }
    setRefError(null);
    setRefResult(null);
    setRefLoading(true);
    try {
      const res = await fetch(`/api/lenses/watch/lookup?ref=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as WatchLookupResult;
      if (!res.ok) {
        setRefError((data as { error?: string }).error ?? "Lookup failed.");
        return;
      }
      setRefResult(data);
      if (data.found) {
        setHint(buildWatchHint(data));
      }
    } catch {
      setRefError("Could not reach Chrono24 — please try again.");
    } finally {
      setRefLoading(false);
    }
  }

  async function processFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const slots = MAX_PHOTOS - photoUrls.length;
    if (slots <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos already added.`);
      return;
    }
    setError(null);
    const toUpload = arr.slice(0, slots);
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadLabel(
        toUpload.length > 1
          ? `Uploading photo ${i + 1} of ${toUpload.length}`
          : "Uploading photo"
      );
      const result = await uploadFile(file);
      if (result) {
        const publicUrl = `${window.location.origin}/api/storage${result.objectPath}`;
        setPhotoUrls((prev) =>
          prev.length < MAX_PHOTOS ? [...prev, publicUrl] : prev
        );
      }
    }
    setUploadLabel("");
  }

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photoUrls.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photoUrls.length]
  );

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      setAnalysisLabel("Creating listing…");
      const createData = await createStudioItem.mutateAsync({
        data: {
          lens: selectedLens,
          marketplace: selectedMarketplace,
          photoUrls: photoUrls.length > 0 ? photoUrls : [],
        },
      });
      const itemId = createData.id;

      if (photoUrls.length > 0) {
        setAnalysisLabel("Analysing with AI…");
        try {
          await analyseStudioItem.mutateAsync({
            id: itemId,
            data: {
              lens: selectedLens,
              photoUrls,
              ...(hint.trim() ? { hint: hint.trim() } : {}),
            },
          });
        } catch {
          // Navigate to detail even if analysis fails — user can retry there
        }
      }

      setLocation(`/studio/${itemId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start listing");
    } finally {
      setLoading(false);
      setAnalysisLabel("");
    }
  }

  const hasPhotos = photoUrls.length > 0;
  const isBusy = loading || isUploading;
  const isWatchLens = selectedLens === "WatchLens";

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Studio · New listing
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">New Listing</h1>
          <p className="text-zinc-400 text-sm">
            Choose your lens and marketplace, then upload photos for instant AI analysis.
          </p>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        {/* Lens picker */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Choose Lens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {LENSES.map((lens) => (
                <button
                  key={lens.id}
                  onClick={() => setSelectedLens(lens.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedLens === lens.id
                      ? "border-cyan-500 bg-cyan-950/40"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{lens.icon}</div>
                  <div className="font-semibold text-sm text-white">{lens.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{lens.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* WatchLens — Chrono24 reference lookup */}
        {isWatchLens && (
          <Card className="mb-4 border-cyan-900/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono-hud tracking-[0.18em] uppercase text-cyan-300">
                  WatchLens · Reference lookup
                </p>
              </div>
              <p className="text-zinc-400 text-xs mt-1">
                Know the reference number? Search Chrono24 to auto-fill watch details and live pricing.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                  placeholder="e.g. 116610LN, 5711/1A, 3135…"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !refLoading && handleRefLookup()}
                  disabled={refLoading}
                />
                <Button
                  onClick={handleRefLookup}
                  disabled={refLoading || refInput.trim().length < 3}
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                >
                  {refLoading ? <Spinner className="text-xs" /> : "Search"}
                </Button>
              </div>

              {refError && (
                <p className="text-red-400 text-xs">{refError}</p>
              )}

              {refResult && !refResult.found && (
                <p className="text-zinc-500 text-xs">
                  No Chrono24 listings found for "{refResult.ref}". Check the reference number or continue without it.
                </p>
              )}

              {refResult?.found && (
                <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/20 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {refResult.brand ?? "Unknown brand"}{refResult.model ? ` · ${refResult.model}` : ""}
                      </p>
                      {refResult.reference_number && (
                        <p className="text-xs text-zinc-400 mt-0.5">Ref {refResult.reference_number}</p>
                      )}
                      {refResult.case_material && (
                        <p className="text-xs text-zinc-500">Case: {refResult.case_material}</p>
                      )}
                    </div>
                    {refResult.price_median_gbp != null && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-zinc-500 mb-0.5">Chrono24 median</p>
                        <p className="text-base font-semibold text-cyan-300">
                          £{refResult.price_median_gbp.toLocaleString()}
                        </p>
                        {refResult.price_min_gbp != null && refResult.price_max_gbp != null && (
                          <p className="text-xs text-zinc-500">
                            £{refResult.price_min_gbp.toLocaleString()}–£{refResult.price_max_gbp.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {refResult.total_count != null && (
                    <p className="text-xs text-zinc-600">
                      Based on {refResult.total_count.toLocaleString()} active Chrono24 listings
                    </p>
                  )}
                  <p className="text-xs text-emerald-400">
                    Details auto-filled into hint — AI will use this for accurate pricing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lens-specific photo guidance */}
        <LensGuidancePanel lensId={selectedLens} hasPhotos={hasPhotos} />

        {/* Marketplace picker */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {MARKETPLACES.map((mp) => (
                <button
                  key={mp.id}
                  onClick={() => setSelectedMarketplace(mp.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedMarketplace === mp.id
                      ? "border-violet-500 bg-violet-950/40 text-violet-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {mp.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photo upload */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Photos</CardTitle>
              <span className="text-xs text-zinc-400">{photoUrls.length}/{MAX_PHOTOS}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={[
                "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer",
                isDragging
                  ? "border-cyan-500 bg-cyan-950/30"
                  : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600",
              ].join(" ")}
              onClick={() => !isBusy && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                onChange={handleFileInput}
                disabled={isBusy || photoUrls.length >= MAX_PHOTOS}
              />

              {isUploading ? (
                <div className="w-full max-w-xs space-y-3">
                  <ProgressBar
                    value={uploadProgress}
                    label={uploadLabel || "Uploading…"}
                  />
                </div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm text-zinc-300">
                      <span className="text-cyan-400 font-medium">Click to upload</span>{" "}
                      or drag & drop
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      JPG, PNG, WebP — up to {MAX_PHOTOS} photos
                    </p>
                  </div>
                </>
              )}
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photoUrls.map((u, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900"
                  >
                    <img
                      src={u}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                      <span className="text-xs text-zinc-300">{i + 1}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removePhoto(u); }}
                      className="absolute top-1 right-1 bg-black/70 rounded-full w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!hasPhotos && (
              <p className="text-xs text-zinc-500 text-center">
                Optional — you can also add photos on the next page.
              </p>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {loading && (
          <div className="brand-card p-4 mb-4">
            <ProgressBar value={hasPhotos ? 60 : 30} label={analysisLabel || "Processing…"} />
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={isBusy}
          className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 h-12 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner className="text-base text-cyan-200" />
              {analysisLabel || "Processing…"}
            </span>
          ) : hasPhotos ? (
            `Analyse with AI →`
          ) : (
            `Continue with ${selectedLens} →`
          )}
        </Button>

        {hasPhotos && (
          <p className="text-xs text-zinc-500 text-center mt-3">
            {photoUrls.length} photo{photoUrls.length !== 1 ? "s" : ""} ready · AI analysis starts immediately
          </p>
        )}
      </main>
    </div>
  );
}
