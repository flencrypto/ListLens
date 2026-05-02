
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListingEditor } from "@/components/studio/listing-editor";
import { AnalysisReveal } from "@/components/ui/analysis-reveal";
import type { StudioOutput } from "@/lib/ai/schemas";
import { useUpload } from "@workspace/object-storage-web";
import { useAnalyseStudioItem } from "@workspace/api-client-react";

const MAX_PHOTOS = 8;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

function useSimulatedProgress(active: boolean, target = 88, stepMs = 600) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (ref.current) clearInterval(ref.current);
      setValue(0);
      return;
    }
    ref.current = setInterval(() => {
      setValue((prev) => {
        if (prev >= target) return prev;
        const remaining = target - prev;
        const step = Math.max(0.5, remaining * 0.06 + Math.random() * 2);
        return Math.min(target, prev + step);
      });
    }, stepMs);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [active, target, stepMs]);

  return value;
}

interface RecordMatch {
  artist?: string | null;
  title?: string | null;
  label?: string | null;
  catalogue_number?: string | null;
  likely_release?: string;
  likelihood_percent?: number;
  evidence?: string[];
}

interface RecordIdentification {
  top_match?: RecordMatch;
  alternate_matches?: RecordMatch[];
  needs_matrix_for_clarification?: boolean;
  warnings?: string[];
  disclaimer?: string;
}

function LikelihoodBar({ percent }: { percent: number }) {
  const color =
    percent >= 80
      ? "bg-emerald-500"
      : percent >= 60
      ? "bg-amber-500"
      : "bg-zinc-500";
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function MatchCard({
  match,
  rank,
}: {
  match: RecordMatch;
  rank: "top" | "alternate";
}) {
  const likelihood = match.likelihood_percent ?? 0;
  const isTop = rank === "top";
  return (
    <div
      className={[
        "rounded-xl border p-4 space-y-3",
        isTop
          ? "border-emerald-800/60 bg-emerald-950/20"
          : "border-zinc-800 bg-zinc-900/40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-white">
            {match.artist ?? "Unknown artist"}{" "}
            {match.title ? `— ${match.title}` : ""}
          </p>
          {match.label && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {match.label}
              {match.catalogue_number ? ` · ${match.catalogue_number}` : ""}
            </p>
          )}
          {match.likely_release && (
            <p className="text-xs text-zinc-500 mt-0.5">{match.likely_release}</p>
          )}
        </div>
        <Badge
          variant={likelihood >= 80 ? "success" : likelihood >= 60 ? "warning" : "secondary"}
          className="shrink-0 text-xs"
        >
          {likelihood}% likely
        </Badge>
      </div>
      <LikelihoodBar percent={likelihood} />
      {match.evidence && match.evidence.length > 0 && (
        <ul className="space-y-0.5">
          {match.evidence.map((e, i) => (
            <li key={i} className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="text-cyan-500 shrink-0">·</span> {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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

export default function StudioItemPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const analyseStudioItem = useAnalyseStudioItem();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [analysis, setAnalysis] = useState<StudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [itemLens, setItemLens] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadLabel, setUploadLabel] = useState("");
  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onError: (err) => setError(`Upload failed: ${err.message}`),
  });

  const rawAnalysisProgress = useSimulatedProgress(loading, 88, 500);
  const analysisProgress = loading
    ? Math.round(rawAnalysisProgress)
    : analysis
    ? 100
    : 0;

  // Clarification state
  const [matrixSideA, setMatrixSideA] = useState("");
  const [matrixSideB, setMatrixSideB] = useState("");
  const [matrixSideCD, setMatrixSideCD] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyError, setClarifyError] = useState<string | null>(null);
  const [clarifyResult, setClarifyResult] = useState<RecordIdentification | null>(null);
  const [clarifyDone, setClarifyDone] = useState(false);
  const [stillNeedsMatrix, setStillNeedsMatrix] = useState(false);

  // WatchLens reference lookup state
  const [refInput, setRefInput] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refResult, setRefResult] = useState<WatchLookupResult | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/items/${id}/analysis`).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.analysis) {
            setAnalysis(data.analysis as StudioOutput);
            setRevealed(true);
          }
        }
      }).catch(() => {}),
      fetch(`/api/items/${id}`).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.listing?.lens) setItemLens(data.listing.lens as string);
        }
      }).catch(() => {}),
    ]).finally(() => setLoadingExisting(false));
  }, [id]);

  // Persist photoUrls to the DB on every user-driven change so the dashboard
  // thumbnail stays current regardless of whether analysis has run.
  // A mount ref skips the initial render (photoUrls = []) to avoid a no-op
  // write; every subsequent change — including removing all photos — is always
  // persisted without being gated on analysis state.
  // The ref resets when `id` changes to guard against cross-item state bleed
  // if the component is ever reused instead of remounted.
  const photoUrlsMounted = useRef(false);
  useEffect(() => {
    photoUrlsMounted.current = false;
  }, [id]);
  useEffect(() => {
    if (!photoUrlsMounted.current) {
      photoUrlsMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Could not save photo changes.");
        }
      }).catch(() => {
        setError("Could not save photo changes — please check your connection.");
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [photoUrls, id]);

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

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed || photoUrls.includes(trimmed)) return;
    if (photoUrls.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    setPhotoUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setError(null);
  }

  function handleRemoveUrl(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
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

  async function handleAnalyse() {
    if (photoUrls.length === 0) {
      setError("Add at least one photo to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await analyseStudioItem.mutateAsync({
        id,
        data: { photoUrls, hint: hint.trim() || undefined },
      });
      setAnalysis(data.analysis as StudioOutput);
      setClarifyResult(null);
      setClarifyDone(false);
      setStillNeedsMatrix(false);
      setShowReveal(true);
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleRevealDone = useCallback(() => {
    setShowReveal(false);
    setRevealed(true);
  }, []);

  async function handleClarifySubmit() {
    if (!matrixSideA.trim() && !matrixSideB.trim()) {
      setClarifyError("Enter at least one matrix / runout string (Side A or Side B).");
      return;
    }
    setClarifyError(null);
    setClarifyLoading(true);
    try {
      const res = await fetch("/api/lenses/record/identify-with-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: id,
          matrixSideA: matrixSideA.trim() || undefined,
          matrixSideB: matrixSideB.trim() || undefined,
          matrixSideCD: matrixSideCD.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Clarification failed — please try again.");
      const data = await res.json() as {
        identification?: RecordIdentification;
        analysis?: StudioOutput;
      };
      if (data.identification) {
        setClarifyResult(data.identification);
        // Keep clarification panel open if the API still needs more context
        if (data.identification.needs_matrix_for_clarification) {
          setStillNeedsMatrix(true);
        } else {
          setClarifyDone(true);
          setStillNeedsMatrix(false);
        }
      } else {
        setClarifyDone(true);
      }
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      setClarifyError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setClarifyLoading(false);
    }
  }

  // Determine whether RecordLens clarification section should be shown
  const isRecordLens = analysis?.lens === "RecordLens";
  const recordAnalysis = analysis?.record_analysis as Record<string, unknown> | undefined;
  const pressing = recordAnalysis?.pressing as Record<string, unknown> | undefined;
  const pressingConfidence = typeof pressing?.confidence === "number"
    ? pressing.confidence
    : (analysis?.identity?.confidence ?? 1);
  const needsClarification = isRecordLens && !clarifyDone && (
    recordAnalysis?.needs_matrix_for_clarification === true ||
    pressingConfidence < 0.8
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {showReveal && (
        <AnalysisReveal variant="studio" onDone={handleRevealDone} />
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
              Studio · Analysis
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">Studio</h1>
            <div className="hud-divider mt-2 max-w-[120px]" />
          </div>
          <Badge variant="secondary">Item {id.slice(-8)}</Badge>
        </div>

        {loadingExisting && (
          <div className="flex justify-center py-16">
            <Spinner className="text-cyan-400" />
          </div>
        )}

        {!loadingExisting && !analysis && (
          <>
            {/* Photo input */}
            <div className="brand-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Add Photos</h2>
                <span className="text-xs font-normal text-zinc-400">
                  {photoUrls.length}/{MAX_PHOTOS} photos
                </span>
              </div>

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
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  multiple
                  className="sr-only"
                  onChange={handleFileInput}
                  disabled={isUploading || photoUrls.length >= MAX_PHOTOS}
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

              <details className="group">
                <summary className="text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400 transition-colors list-none flex items-center gap-1">
                  <svg
                    className="h-3 w-3 transition-transform group-open:rotate-90"
                    viewBox="0 0 6 10"
                    fill="currentColor"
                  >
                    <path
                      d="M1 1l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  Or paste an image URL
                </summary>
                <div className="flex gap-2 mt-2">
                  <input
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                    placeholder="https://example.com/photo.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                  />
                  <Button onClick={handleAddUrl} variant="secondary" size="sm">
                    Add
                  </Button>
                </div>
              </details>

              {photoUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        onClick={() => handleRemoveUrl(u)}
                        className="absolute top-1 right-1 bg-black/70 rounded-full w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* WatchLens — Chrono24 reference lookup */}
            {(itemLens === "WatchLens" || (!itemLens && false)) && (
              <div className="brand-card p-6 space-y-4 border-cyan-900/40">
                <div>
                  <p className="text-xs font-mono-hud tracking-[0.18em] uppercase text-cyan-300 mb-1">
                    WatchLens · Reference lookup
                  </p>
                  <p className="text-zinc-400 text-xs">
                    Know the reference number? Search Chrono24 to auto-fill watch details and live pricing into the hint below.
                  </p>
                </div>
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

                {refError && <p className="text-red-400 text-xs">{refError}</p>}

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
                      Details auto-filled into hint below — AI will use this for accurate pricing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            <div className="brand-card p-6">
              <h2 className="text-base font-semibold text-white mb-3">
                Optional Hint{" "}
                <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </h2>
              <textarea
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 resize-none"
                rows={3}
                placeholder="e.g. 'Nike Air Max 90 size UK 10, bought 2022, worn maybe 5 times' — helps the AI identify your item faster"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>

            {loading && (
              <div className="brand-card p-6 space-y-3">
                <p className="text-xs font-mono-hud tracking-widest uppercase text-cyan-300">
                  AI · Analysing
                </p>
                <ProgressBar
                  value={analysisProgress}
                  label="Running AI analysis"
                  sublabel={
                    analysisProgress < 30
                      ? "Sending photos…"
                      : analysisProgress < 60
                      ? "Identifying item…"
                      : analysisProgress < 80
                      ? "Generating listing…"
                      : "Finalising…"
                  }
                />
              </div>
            )}

            <Button
              onClick={handleAnalyse}
              disabled={loading || isUploading || photoUrls.length === 0}
              className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-base text-cyan-300" /> Analysing…
                </span>
              ) : (
                "Analyse with AI →"
              )}
            </Button>
          </>
        )}

        {analysis && revealed && (
          <div className="reveal-stagger space-y-6">
            {/* WatchLens — Chrono24 market reference pricing */}
            {analysis.lens === "WatchLens" && (() => {
              const wm = analysis.watch_market;
              if (!wm || wm.listing_count === 0) return null;
              return (
                <div className="brand-card p-6 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-mono-hud tracking-[0.2em] uppercase text-cyan-300">
                      WatchLens · Market reference
                    </p>
                    <Badge variant="secondary" className="text-xs">{wm.source}</Badge>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    Live pre-owned pricing from {wm.total_count.toLocaleString()} active listings
                    {wm.search_query ? ` for "${wm.search_query}"` : ""}. Pricing has been adjusted to reflect this market data.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Min", value: wm.price_min_gbp, color: "text-zinc-300" },
                      { label: "Median", value: wm.price_median_gbp, color: "text-cyan-300", highlight: true },
                      { label: "Max", value: wm.price_max_gbp, color: "text-emerald-300" },
                    ].map(({ label, value, color, highlight }) => (
                      <div
                        key={label}
                        className={[
                          "rounded-xl border p-3 text-center",
                          highlight
                            ? "border-cyan-800/60 bg-cyan-950/20"
                            : "border-zinc-800 bg-zinc-900/40",
                        ].join(" ")}
                      >
                        <p className="text-xs text-zinc-500 mb-1">{label}</p>
                        <p className={`text-base font-semibold ${color}`}>
                          {value !== null && value !== undefined
                            ? `£${value.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600">
                    Market data from {wm.source} · {wm.listing_count} listings retrieved · Used to anchor recommended price
                  </p>
                </div>
              );
            })()}
            {/* RecordLens — ranked likelihoods (always shown for RecordLens) */}
            {isRecordLens && clarifyResult && (
              <div className="brand-card p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-mono-hud tracking-[0.2em] uppercase text-emerald-300">
                    RecordLens · Pressing confirmed
                  </p>
                  {clarifyResult.needs_matrix_for_clarification === false && (
                    <Badge variant="success" className="text-xs">Matrix matched</Badge>
                  )}
                </div>
                <p className="text-zinc-400 text-xs">
                  Ranked matches after matrix / runout analysis. The top result has been used to update your listing.
                </p>

                <div className="space-y-3">
                  {clarifyResult.top_match && (
                    <MatchCard match={clarifyResult.top_match} rank="top" />
                  )}
                  {clarifyResult.alternate_matches && clarifyResult.alternate_matches.length > 0 && (
                    <details className="group">
                      <summary className="text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400 transition-colors list-none flex items-center gap-1 mt-1">
                        <svg
                          className="h-3 w-3 transition-transform group-open:rotate-90"
                          viewBox="0 0 6 10"
                          fill="currentColor"
                        >
                          <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        {clarifyResult.alternate_matches.length} alternate match{clarifyResult.alternate_matches.length !== 1 ? "es" : ""}
                      </summary>
                      <div className="space-y-2 mt-2">
                        {clarifyResult.alternate_matches.map((m, i) => (
                          <MatchCard key={i} match={m} rank="alternate" />
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {clarifyResult.warnings && clarifyResult.warnings.length > 0 && (
                  <div className="space-y-1">
                    {clarifyResult.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-400 flex items-center gap-1.5">
                        <span>⚠</span> {w}
                      </p>
                    ))}
                  </div>
                )}

                {clarifyResult.disclaimer && (
                  <p className="text-xs text-zinc-600 italic">{clarifyResult.disclaimer}</p>
                )}
              </div>
            )}

            {/* RecordLens — initial ranked likelihoods (before clarification) */}
            {isRecordLens && !clarifyResult && (() => {
              const topMatch = recordAnalysis?.top_match as RecordMatch | undefined;
              const altMatches = (recordAnalysis?.alternate_matches as RecordMatch[] | undefined) ?? [];
              return (
                <div className="brand-card p-6 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-mono-hud tracking-[0.2em] uppercase text-cyan-300">
                      RecordLens · Pressing analysis
                    </p>
                    <Badge
                      variant={pressingConfidence >= 0.8 ? "success" : pressingConfidence >= 0.6 ? "warning" : "secondary"}
                      className="text-xs"
                    >
                      {Math.round(pressingConfidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    Ranked release matches based on label photo and Discogs search. Add your matrix/runout text below to improve accuracy.
                  </p>
                  <div className="space-y-3">
                    {topMatch && (
                      <MatchCard match={topMatch} rank="top" />
                    )}
                    {altMatches.length > 0 && (
                      <details className="group">
                        <summary className="text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400 transition-colors list-none flex items-center gap-1 mt-1">
                          <svg
                            className="h-3 w-3 transition-transform group-open:rotate-90"
                            viewBox="0 0 6 10"
                            fill="currentColor"
                          >
                            <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                          {altMatches.length} alternate match{altMatches.length !== 1 ? "es" : ""}
                        </summary>
                        <div className="space-y-2 mt-2">
                          {altMatches.map((m, i) => (
                            <MatchCard key={i} match={m} rank="alternate" />
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* RecordLens — matrix/runout clarification section */}
            {needsClarification && (
              <div className="brand-card p-6 space-y-5 border-amber-900/40">
                <div>
                  <p className="text-xs font-mono-hud tracking-[0.2em] uppercase text-amber-300 mb-1">
                    RecordLens · Confirm pressing
                  </p>
                  <h2 className="text-base font-semibold text-white">
                    Add matrix / runout to improve accuracy
                  </h2>
                </div>

                {stillNeedsMatrix && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-700/50 bg-amber-950/40 px-3 py-2.5">
                    <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                    <p className="text-xs text-amber-200 leading-relaxed">
                      The pressing still couldn't be confirmed — there may be several close matches.
                      Try adding more detail (e.g. Side B etching, cutting codes) to narrow it down.
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                  <p className="text-sm text-zinc-300 font-medium">What is the matrix / runout?</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The matrix (or runout) is a string of characters etched into the vinyl in the
                    blank groove area — the shiny ring between the last track and the label. It
                    identifies the specific pressing, cutting engineer, and generation. Look for text
                    like <span className="text-zinc-300 font-mono">A-1 // Porky</span> or{" "}
                    <span className="text-zinc-300 font-mono">YEX 123-1</span> on each side.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                      Side A matrix / runout <span className="text-amber-400">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 font-mono"
                      placeholder="e.g. A-1 // PORKY or YEX 123-1"
                      value={matrixSideA}
                      onChange={(e) => setMatrixSideA(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                      Side B matrix / runout <span className="text-zinc-600">(recommended)</span>
                    </label>
                    <input
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 font-mono"
                      placeholder="e.g. B-1 // PORKY or YEX 124-1"
                      value={matrixSideB}
                      onChange={(e) => setMatrixSideB(e.target.value)}
                    />
                  </div>
                  <details className="group">
                    <summary className="text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400 transition-colors list-none flex items-center gap-1">
                      <svg
                        className="h-3 w-3 transition-transform group-open:rotate-90"
                        viewBox="0 0 6 10"
                        fill="currentColor"
                      >
                        <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                      Add Side C / D (double albums)
                    </summary>
                    <div className="mt-2">
                      <input
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600 font-mono"
                        placeholder="e.g. C-1 / D-1 matrix strings"
                        value={matrixSideCD}
                        onChange={(e) => setMatrixSideCD(e.target.value)}
                      />
                    </div>
                  </details>
                </div>

                {clarifyError && (
                  <p className="text-red-400 text-sm">{clarifyError}</p>
                )}

                <Button
                  onClick={handleClarifySubmit}
                  disabled={clarifyLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-0 text-white"
                >
                  {clarifyLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="text-amber-200" /> Confirming pressing…
                    </span>
                  ) : (
                    "Confirm pressing →"
                  )}
                </Button>

                {pressingConfidence >= 0.6 && (
                  <button
                    onClick={() => setClarifyDone(true)}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors w-full text-center"
                  >
                    Skip — I'm happy with the current result
                  </button>
                )}
              </div>
            )}

            {/* Listing editor (always shown when analysis is available) */}
            <ListingEditor
              itemId={id}
              analysis={analysis}
              onReset={() => {
                setAnalysis(null);
                setClarifyResult(null);
                setClarifyDone(false);
                setStillNeedsMatrix(false);
                setMatrixSideA("");
                setMatrixSideB("");
                setMatrixSideCD("");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
