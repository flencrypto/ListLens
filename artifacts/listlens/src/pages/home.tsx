import { Link } from "wouter";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CircleAlert,
  Copy,
  FileText,
  HelpCircle,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { BrandGlyph } from "@/components/brand/brand-glyph";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import {
  BrandCartOrb,
  EvidenceStrip,
  HudPanel,
  LensOrb,
  LENS_ICON_MAP,
  ListLensShell,
  MiniEvidenceRow,
  ProductModeCard,
  StatusPill,
  toneClasses,
} from "@/components/listlens/hud";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  BANNED_GUARD_PHRASES,
  MVP_LENSES,
  SAFE_GUARD_PHRASES,
  SOLELENS_EVIDENCE,
  WORKFLOW_STEPS,
} from "@/lib/listlens-mvp";
import { cn } from "@/lib/utils";

const activeLenses = MVP_LENSES.filter((lens) =>
  ["live", "fallback", "next"].includes(lens.status),
);

const recentDrafts = [
  {
    title: "Nike Dunk Low Panda UK 8",
    status: "Draft saved",
    meta: "ShoeLens · eBay + Vinted",
    score: "82% confidence",
  },
  {
    title: "Sony Alpha A7 III camera body",
    status: "Needs extra proof",
    meta: "General Lens · eBay",
    score: "3 missing photos",
  },
];

const recentReports = [
  {
    title: "Jordan 1 Lost & Found listing",
    status: "Medium risk",
    meta: "Missing size tag and heel tab",
    score: "5 seller questions",
  },
  {
    title: "Vinted trainer screenshot",
    status: "Unclear",
    meta: "Stock photos only",
    score: "Ask first",
  },
];

function LensRoadmap() {
  return (
    <HudPanel tone="cyan" className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Core Resale Lenses</h2>
          <p className="mt-1 text-sm text-slate-400">
            Different category intelligence. Same trust layer.
          </p>
        </div>
        <StatusPill tone="cyan">One engine</StatusPill>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {activeLenses.map((lens) => {
          const Icon = LENS_ICON_MAP[lens.id] ?? Sparkles;
          const tone = lens.accent;
          const isLive = lens.status === "live" || lens.status === "fallback";
          return (
            <div
              key={lens.id}
              className={cn(
                "rounded-lg border bg-[#071423]/75 p-4",
                toneClasses[tone].border,
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <LensOrb icon={Icon} tone={tone} size="sm" />
                <StatusPill tone={tone}>
                  {isLive ? lens.phase : "Next"}
                </StatusPill>
              </div>
              <h3 className="text-sm font-bold text-white">{lens.displayName}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {lens.category}
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-400">{lens.purpose}</p>
            </div>
          );
        })}
      </div>
    </HudPanel>
  );
}

function StudioPreview() {
  return (
    <HudPanel tone="cyan" className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <StatusPill tone="cyan">ListLens Studio</StatusPill>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
            Photo evidence to seller draft
          </h2>
        </div>
        <LensOrb icon={Camera} tone="cyan" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/10 p-4">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
            <span>Upload photos</span>
            <span>0 / 8</span>
          </div>
          <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-cyan-300/20 bg-black/25 text-center">
            <ImagePlus className="mb-3 text-cyan-300" size={34} strokeWidth={1.6} />
            <p className="text-sm font-semibold text-white">Drag item photos here</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-slate-500">
              Sole, size label, box, condition marks and proof of purchase if available.
            </p>
          </div>
          <Button asChild className="mt-4 w-full border-0 bg-cyan-500 text-slate-950 hover:bg-cyan-300">
            <Link href="/studio/new">
              <Upload size={16} />
              Create seller listing
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-cyan-300/20 bg-[#061120] p-4">
            <p className="font-mono-hud text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              Marketplace title
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">
              Nike Dunk Low Panda Black White Trainers UK 8 · Box Included
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>72 / 80 characters</span>
              <span className="text-cyan-300">eBay-ready</span>
            </div>
          </div>
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <CircleAlert size={16} />
              Missing evidence
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-100/70">
              Add a clear tongue-size label and heel-tab close-up before publishing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-slate-500">Quick sale</p>
              <p className="mt-1 text-lg font-bold text-white">£62-70</p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3">
              <p className="text-xs text-cyan-300">Recommended</p>
              <p className="mt-1 text-lg font-bold text-white">£78-86</p>
            </div>
          </div>
        </div>
      </div>
    </HudPanel>
  );
}

function GuardPreview() {
  return (
    <HudPanel tone="violet" className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <StatusPill tone="violet">ListLens Guard</StatusPill>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
            Listing evidence to buyer report
          </h2>
        </div>
        <LensOrb icon={ShieldCheck} tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-violet-300/20 bg-[#061120] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono-hud text-[10px] uppercase tracking-[0.2em] text-violet-300">
              Guard report
            </p>
            <StatusPill tone="amber">Medium risk</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: CircleAlert, label: "Missing evidence", value: "5", tone: "red" as const },
              { icon: CheckCircle2, label: "Price check", value: "High", tone: "amber" as const },
              { icon: HelpCircle, label: "Questions", value: "7", tone: "blue" as const },
            ].map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <Icon className={toneClasses[tone].text} size={18} strokeWidth={1.7} />
                <p className="mt-3 text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1">
            <MiniEvidenceRow label="Size label photo" value="Missing" tone="red" />
            <MiniEvidenceRow label="Box label" value="Unclear" tone="amber" />
            <MiniEvidenceRow label="Sole wear" value="Visible" tone="green" />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-lg border border-dashed border-violet-300/25 bg-violet-300/10 p-4">
          <div>
            <p className="font-mono-hud text-[10px] uppercase tracking-[0.2em] text-violet-300">
              Paste listing URL
            </p>
            <div className="mt-3 rounded-md border border-violet-300/20 bg-black/30 px-3 py-3 text-xs text-slate-500">
              https://www.ebay.co.uk/itm/...
            </div>
          </div>
          <Button asChild className="w-full border-0 bg-violet-500 text-white hover:bg-violet-400">
            <Link href="/guard/new">
              <ShieldCheck size={16} />
              Run Guard check
            </Link>
          </Button>
        </div>
      </div>
    </HudPanel>
  );
}

function HistoryColumn({
  title,
  items,
  tone,
  href,
}: {
  title: string;
  items: typeof recentDrafts;
  tone: "cyan" | "violet";
  href: string;
}) {
  return (
    <HudPanel tone={tone} className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <Link href={href} className={cn("text-xs font-semibold", toneClasses[tone].text)}>
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
              </div>
              <span className={cn("shrink-0 text-xs font-semibold", toneClasses[tone].text)}>
                {item.status}
              </span>
            </div>
            <p className="mt-3 font-mono-hud text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {item.score}
            </p>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

export default function HomePage() {
  return (
    <ListLensShell>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandGlyph size={42} animated showSparks={false} />
          <BrandWordmark layout="inline" size="sm" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[color:var(--brand-text-muted)] md:flex">
          <Link href="/studio/new" className="hover:text-[color:var(--brand-text-strong)]">Studio</Link>
          <Link href="/guard/new" className="hover:text-[color:var(--brand-text-strong)]">Guard</Link>
          <Link href="/lenses" className="hover:text-[color:var(--brand-text-strong)]">Lenses</Link>
          <Link href="/billing" className="hover:text-[color:var(--brand-text-strong)]">Credits</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden lg:inline-flex" />
          <Button asChild className="border-0 bg-gradient-to-r from-[#0082ff] to-[#00f0ff] text-white shadow-[0_20px_36px_-24px_rgba(0,130,255,0.95)] hover:brightness-110">
            <Link href="/dashboard">
              Open cockpit
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <HudPanel tone="cyan" className="p-6 lg:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <StatusPill tone="cyan">Rev 1.0 POC / MVP</StatusPill>
                <h1 className="mt-6 max-w-3xl font-brand-display text-4xl font-black uppercase leading-tight tracking-[0.08em] text-white sm:text-5xl lg:text-6xl">
                  List smarter. Buy safer.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  ListLens turns item photos, listing links and screenshots into evidence-led seller drafts and buyer risk reports.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="border-0 bg-gradient-to-r from-[#0082ff] to-[#00f0ff] font-bold text-white hover:brightness-110">
                    <Link href="/studio/new">
                      <Camera size={18} />
                      Create seller listing
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-[#7a00ff]/45 bg-[#7a00ff]/10 font-bold text-[#ead8ff] hover:bg-[#7a00ff]/20 hover:text-white">
                    <Link href="/guard/new">
                      <ShieldCheck size={18} />
                      Check buyer listing
                    </Link>
                  </Button>
                </div>
              </div>
              <BrandCartOrb className="mx-auto hidden md:flex" />
            </div>
            <EvidenceStrip className="mt-8" />
          </HudPanel>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <ProductModeCard
              tone="cyan"
              icon={Camera}
              title="Studio"
              label="For sellers"
              body="Upload item photos, choose eBay or Vinted, then save an evidence-backed marketplace draft."
              cta="Start Studio"
              href="/studio/new"
            />
            <ProductModeCard
              tone="violet"
              icon={ShieldCheck}
              title="Guard"
              label="For buyers"
              body="Paste a listing or add screenshots before buying, then ask better seller questions."
              cta="Run Guard"
              href="/guard/new"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <StudioPreview />
          <GuardPreview />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <LensRoadmap />

          <div className="space-y-6">
            <HudPanel tone="green" className="p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">SoleLens evidence</h2>
                <StatusPill tone="green">Live wedge</StatusPill>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SOLELENS_EVIDENCE.map((item) => (
                  <div key={item} className="rounded-md border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </HudPanel>

            <HudPanel tone="amber" className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <LensOrb icon={FileText} tone="amber" size="sm" />
                <div>
                  <h2 className="text-lg font-bold text-white">Credits & pricing</h2>
                  <p className="text-sm text-slate-500">Built for subscriptions and point-of-need checks.</p>
                </div>
              </div>
              <div className="space-y-1">
                <MiniEvidenceRow label="Studio Starter" value="GBP 9.99/mo" tone="cyan" />
                <MiniEvidenceRow label="Studio Reseller" value="GBP 24.99/mo" tone="cyan" />
                <MiniEvidenceRow label="Guard Single" value="GBP 1.99/check" tone="violet" />
                <MiniEvidenceRow label="Guard Monthly" value="10 checks" tone="violet" />
              </div>
              <Button asChild variant="outline" className="mt-4 w-full border-amber-300/35 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20">
                <Link href="/billing">Open credits</Link>
              </Button>
            </HudPanel>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <HistoryColumn title="Recent Studio drafts" items={recentDrafts} tone="cyan" href="/history" />
          <HistoryColumn title="Recent Guard reports" items={recentReports} tone="violet" href="/history" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <HudPanel tone="blue" className="p-5">
            <h2 className="text-lg font-bold text-white">Sticky loop</h2>
            <div className="mt-4 space-y-3">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-300/25 bg-blue-300/10 font-mono-hud text-[10px] text-blue-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </HudPanel>

          <HudPanel tone="violet" className="p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Safe Guard wording</h2>
              <StatusPill tone="violet">Not authentication</StatusPill>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Use
                </p>
                <div className="space-y-2">
                  {SAFE_GUARD_PHRASES.slice(0, 4).map((phrase) => (
                    <p key={phrase} className="rounded-md border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-xs leading-5 text-slate-300">
                      {phrase}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                  Avoid
                </p>
                <div className="space-y-2">
                  {BANNED_GUARD_PHRASES.slice(0, 4).map((phrase) => (
                    <p key={phrase} className="rounded-md border border-red-300/15 bg-red-300/10 px-3 py-2 text-xs leading-5 text-slate-400">
                      {phrase}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </HudPanel>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[color:var(--brand-outline)] py-6 text-xs text-[color:var(--brand-text-muted)] sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandGlyph size={24} showSparks={false} />
            <span>All products. One intelligence. Powered by ListLens.</span>
          </div>
          <div className="flex items-center gap-3">
            <Copy size={14} />
            <span>Evidence-first resale intelligence</span>
          </div>
        </footer>
      </main>
    </ListLensShell>
  );
}
