
import { useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useUpload } from "@workspace/object-storage-web";
import type {
  RecordReleaseIdentification,
} from "@/lib/ai/schemas";

/**
 * RecordLens — upload label photos for release identification with optional
 * matrix/runout clarification follow-up. Returns a ranked list of likely
 * pressings rather than a single overconfident answer.
 */

type IdentifyResult = RecordReleaseIdentification;

const MAX_PHOTOS = 6;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export default function RecordLensIdentifyPage() {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [hint, setHint] = useState<string>("");
  const [matrixA, setMatrixA] = useState("");
  const [matrixB, setMatrixB] = useState("");
  const [extraSymbols, setExtraSymbols] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onError: (err) => setError(`Upload failed: ${err.message}`),
  });

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

  async function runIdentify() {
    setError(null);
    if (photoUrls.length === 0) {
      setError("Upload at least one label photo to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lenses/record/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelPhotoUrls: photoUrls, hint: hint || undefined }),
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
    if (photoUrls.length === 0) {
      setError("Upload at least one label photo to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lenses/record/identify-with-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labelPhotoUrls: photoUrls,
          hint: hint || undefined,
          matrixSideA: matrixA || undefined,
          matrixSideB: matrixB || undefined,
          matrixSideCD: extraSymbols || undefined,
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
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · RecordLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💿</span>
            <div>
              <h1 className="text-2xl font-bold text-white">RecordLens · Label Identify</h1>
              <p className="text-zinc-400 text-sm">
                Upload label photo(s) to get ranked likely releases. Add matrix runout details
                to clarify the pressing.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Label photos</CardTitle>
              <span className="text-xs text-zinc-400">{photoUrls.length}/{MAX_PHOTOS}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      JPG, PNG, WebP — front label, back label, and matrix etchings
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Photo thumbnails */}
            {photoUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {photoUrls.map((u, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900"
                  >
                    <img
                      src={u}
                      alt={`Label photo ${i + 1}`}
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

            {/* Optional hint */}
            <div>
              <label htmlFor="seller-hint" className="block text-xs text-zinc-400 mb-1">
                Optional hint <span className="text-zinc-600">(artist, title, or context)</span>
              </label>
              <input
                id="seller-hint"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. Radiohead OK Computer, UK pressing"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              onClick={runIdentify}
              disabled={loading || isUploading || photoUrls.length === 0}
              className="w-full bg-cyan-600 hover:bg-cyan-500 border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-base text-cyan-200" /> Analysing…
                </span>
              ) : (
                "Identify from label →"
              )}
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
              <input
                id="matrix-side-a"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                value={matrixA}
                onChange={(e) => setMatrixA(e.target.value)}
                placeholder="e.g. OKNOTOK A-1"
              />
              <label htmlFor="matrix-side-b" className="block text-xs text-zinc-400 mb-1">
                Side B matrix runout
              </label>
              <input
                id="matrix-side-b"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                value={matrixB}
                onChange={(e) => setMatrixB(e.target.value)}
                placeholder="e.g. OKNOTOK B-1"
              />
              <label htmlFor="matrix-extra-symbols" className="block text-xs text-zinc-400 mb-1">
                Extra symbols / initials
              </label>
              <input
                id="matrix-extra-symbols"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-600"
                value={extraSymbols}
                onChange={(e) => setExtraSymbols(e.target.value)}
                placeholder="e.g. MPO, RL, ▲"
              />
              <Button
                onClick={runWithMatrix}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 border-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="text-base text-violet-200" /> Re-ranking…
                  </span>
                ) : (
                  "Re-rank with matrix"
                )}
              </Button>
            </CardContent>
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
