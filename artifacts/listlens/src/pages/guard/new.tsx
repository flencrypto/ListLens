
import { useRef, useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  HudPanel,
  LensOrb,
  LENS_ICON_MAP,
  ListLensShell,
  StatusPill,
} from "@/components/listlens/hud";
import { GUARD_LENS_OPTIONS, SAFE_GUARD_PHRASES } from "@/lib/listlens-mvp";
import { useUpload } from "@workspace/object-storage-web";
import { useCreateGuardCheck } from "@workspace/api-client-react";

const LENSES = GUARD_LENS_OPTIONS.map((lens) => ({
  id: lens.id,
  name: lens.displayName,
  desc: lens.category,
  tone: lens.accent,
  phase: lens.phase,
}));

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_SCREENSHOTS = 6;

export default function NewGuardPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialLens = params.get("lens") ?? "ShoeLens";
  const [tab, setTab] = useState<"url" | "screenshots">("url");
  const [url, setUrl] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [lens, setLens] = useState(
    LENSES.some((l) => l.id === initialLens) ? initialLens : "ShoeLens"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadLabel, setUploadLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createGuardCheck = useCreateGuardCheck();
  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onError: (err) => setError(`Screenshot upload failed: ${err.message}`),
  });

  useEffect(() => {
    const lensParam = params.get("lens");
    if (lensParam && LENSES.some((l) => l.id === lensParam)) {
      setLens(lensParam);
    }
  }, [search]);

  function handleAddScreenshot() {
    const trimmed = screenshotInput.trim();
    if (!trimmed) return;
    if (screenshotUrls.includes(trimmed)) {
      setScreenshotInput("");
      return;
    }
    if (screenshotUrls.length >= MAX_SCREENSHOTS) {
      setError(`Maximum ${MAX_SCREENSHOTS} screenshots allowed.`);
      return;
    }
    setScreenshotUrls((prev) => [...prev, trimmed]);
    setScreenshotInput("");
    setError(null);
  }

  async function processScreenshotFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    const slots = MAX_SCREENSHOTS - screenshotUrls.length;
    if (slots <= 0) {
      setError(`Maximum ${MAX_SCREENSHOTS} screenshots already added.`);
      return;
    }
    setError(null);
    const selected = images.slice(0, slots);
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      setUploadLabel(
        selected.length > 1
          ? `Uploading screenshot ${i + 1} of ${selected.length}`
          : "Uploading screenshot"
      );
      const result = await uploadFile(file);
      if (result) {
        const publicUrl = `${window.location.origin}/api/storage${result.objectPath}`;
        setScreenshotUrls((prev) =>
          prev.length < MAX_SCREENSHOTS ? [...prev, publicUrl] : prev
        );
      }
    }
    setUploadLabel("");
  }

  async function handleStart() {
    const hasInput = tab === "url" ? url.trim() : screenshotUrls.length > 0;
    if (!hasInput) {
      setError(tab === "url" ? "Enter a listing URL." : "Add at least one screenshot URL.");
      return;
    }
    setError(null);
    setLoading(true);
    let navigated = false;
    try {
      const data = await createGuardCheck.mutateAsync({
        data: {
          url: tab === "url" ? url.trim() : undefined,
          screenshotUrls: tab === "screenshots" ? screenshotUrls : undefined,
          lens,
        },
      });
      navigated = true;
      setLocation(`/guard/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  return (
    <ListLensShell>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-violet-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Guard · New check
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Check buyer listing</h1>
          <p className="text-zinc-400 text-sm">Paste a listing URL or upload screenshots before you buy.</p>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        {/* Input method tabs */}
        <HudPanel tone="violet" className="p-5 mb-4">
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden w-fit mb-5">
            <button
              onClick={() => setTab("url")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "url" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              🔗 Listing URL
            </button>
            <button
              onClick={() => setTab("screenshots")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "screenshots" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              🖼 Screenshots
            </button>
          </div>

          {tab === "url" && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-sm">Paste an eBay or Vinted listing URL</p>
              <Input
                placeholder="https://www.ebay.co.uk/itm/... or https://www.vinted.co.uk/items/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="bg-zinc-900 border-zinc-700 focus:border-violet-600"
              />
            </div>
          )}

          {tab === "screenshots" && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-sm">Upload screenshots or paste image URLs (up to {MAX_SCREENSHOTS})</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files) void processScreenshotFiles(event.target.files);
                  event.target.value = "";
                }}
                disabled={isUploading || screenshotUrls.length >= MAX_SCREENSHOTS}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || screenshotUrls.length >= MAX_SCREENSHOTS}
                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-violet-300/25 bg-violet-300/10 px-4 py-6 text-center transition hover:border-violet-300/45 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <div className="w-full max-w-xs">
                    <ProgressBar value={uploadProgress} label={uploadLabel || "Uploading screenshot"} />
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-violet-100">Choose screenshot files</span>
                    <span className="mt-1 text-xs text-zinc-500">JPG, PNG, WebP or AVIF</span>
                  </>
                )}
              </button>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-600"
                  placeholder="https://example.com/screenshot.jpg"
                  value={screenshotInput}
                  onChange={(e) => setScreenshotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddScreenshot()}
                />
                <Button onClick={handleAddScreenshot} variant="secondary" size="sm">Add</Button>
              </div>
              {screenshotUrls.length > 0 && (
                <div className="space-y-1">
                  {screenshotUrls.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 rounded-lg border border-violet-900/30 bg-zinc-900/60 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.06)]">
                      <span className="text-zinc-600 w-4">{i + 1}</span>
                      <span className="truncate flex-1">{u}</span>
                      <button onClick={() => setScreenshotUrls((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </HudPanel>

        {/* Lens picker */}
        <HudPanel tone="violet" className="p-5 mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Choose Lens</h2>
              <p className="mt-1 text-xs text-zinc-500">Rev 1.0 routes Guard through ShoeLens or General fallback.</p>
            </div>
            <StatusPill tone="violet">AI-assisted risk screen</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {LENSES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLens(l.id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  lens === l.id
                    ? "border-violet-500 bg-violet-950/40"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <LensOrb
                    icon={LENS_ICON_MAP[l.id] ?? LENS_ICON_MAP.GeneralLens}
                    tone={l.tone}
                    size="sm"
                  />
                  <StatusPill tone={l.tone}>{l.phase}</StatusPill>
                </div>
                <div className="font-semibold text-sm text-white leading-tight">{l.name}</div>
                <div className="mt-1 text-xs text-zinc-400">{l.desc}</div>
              </button>
            ))}
          </div>
        </HudPanel>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0"
        >
          {loading ? "Starting check…" : "Run Guard Check →"}
        </Button>

        <p className="text-center text-xs text-zinc-600 mt-4">
          {SAFE_GUARD_PHRASES[0]} This is not formal authentication.
        </p>
      </main>
    </ListLensShell>
  );
}
