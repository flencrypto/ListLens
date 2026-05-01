
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ListingEditor } from "@/components/studio/listing-editor";
import type { StudioOutput } from "@/lib/ai/schemas";
import { capture } from "@/lib/posthog";
import { useUpload } from "@workspace/object-storage-web";

const MAX_PHOTOS = 8;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export default function StudioItemPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [analysis, setAnalysis] = useState<StudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onError: (err) => setError(`Upload failed: ${err.message}`),
  });

  useEffect(() => {
    fetch(`/api/items/${id}/analysis`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.analysis) setAnalysis(data.analysis as StudioOutput);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [id]);

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
    for (const file of toUpload) {
      const result = await uploadFile(file);
      if (result) {
        const publicUrl = `${window.location.origin}/api/storage${result.objectPath}`;
        setPhotoUrls((prev) =>
          prev.length < MAX_PHOTOS ? [...prev, publicUrl] : prev
        );
      }
    }
  }

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = "";
    },
    [photoUrls.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [photoUrls.length]
  );

  async function handleAnalyse() {
    if (photoUrls.length === 0) {
      setError("Add at least one photo to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    capture("studio_analysis_started", { itemId: id, photoCount: photoUrls.length, hasHint: Boolean(hint.trim()) });
    try {
      const res = await fetch(`/api/items/${id}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls, hint: hint.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data.analysis);
      capture("studio_analysis_completed", { itemId: id, lens: data.analysis?.lens });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
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
                <span className="text-xs font-normal text-zinc-400">{photoUrls.length}/{MAX_PHOTOS} photos</span>
              </div>

              {/* Drop zone */}
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
                  <>
                    <Spinner className="text-cyan-400 text-xl" />
                    <p className="text-sm text-zinc-400">
                      Uploading… {progress > 0 && progress < 100 ? `${progress}%` : ""}
                    </p>
                  </>
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm text-zinc-300">
                        <span className="text-cyan-400 font-medium">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP — up to {MAX_PHOTOS} photos</p>
                    </div>
                  </>
                )}
              </div>

              {/* URL input fallback */}
              <details className="group">
                <summary className="text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400 transition-colors list-none flex items-center gap-1">
                  <svg className="h-3 w-3 transition-transform group-open:rotate-90" viewBox="0 0 6 10" fill="currentColor">
                    <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
                  <Button onClick={handleAddUrl} variant="secondary" size="sm">Add</Button>
                </div>
              </details>

              {/* Photo thumbnails */}
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

        {analysis && <ListingEditor itemId={id} analysis={analysis} onReset={() => setAnalysis(null)} />}
      </main>
    </div>
  );
}
