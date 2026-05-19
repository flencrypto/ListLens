import type { HTMLAttributes } from "react";
import { Link } from "wouter";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Box,
  BrainCircuit,
  Camera,
  Car,
  CircleDot,
  Cpu,
  FileText,
  Footprints,
  Gauge,
  Globe2,
  PenTool,
  Ruler,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trophy,
  Watch,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { BrandGlyph } from "@/components/brand/brand-glyph";
import { LENS_ICON_MAP as CANONICAL_LENS_ICON_MAP } from "@/lib/lenses-registry";
import { cn } from "@/lib/utils";

export type HudTone = "cyan" | "blue" | "green" | "violet" | "amber" | "orange" | "red";
export type LensIcon = LucideIcon;

export const toneClasses: Record<
  HudTone,
  {
    text: string;
    border: string;
    bg: string;
    glow: string;
    fill: string;
  }
> = {
  cyan: {
    text: "text-cyan-600 dark:text-[#7fefff]",
    border: "border-[#00f0ff]/30",
    bg: "bg-[#00f0ff]/10",
    glow: "shadow-[0_0_28px_-12px_rgba(0,240,255,0.7)]",
    fill: "bg-[#00f0ff]",
  },
  blue: {
    text: "text-blue-600 dark:text-[#9dc4ff]",
    border: "border-[#0082ff]/32",
    bg: "bg-[#0082ff]/10",
    glow: "shadow-[0_0_28px_-12px_rgba(0,130,255,0.72)]",
    fill: "bg-[#0082ff]",
  },
  green: {
    text: "text-teal-600 dark:text-[#8ff7ff]",
    border: "border-[#19d8ff]/30",
    bg: "bg-[#19d8ff]/10",
    glow: "shadow-[0_0_28px_-12px_rgba(25,216,255,0.72)]",
    fill: "bg-[#19d8ff]",
  },
  violet: {
    text: "text-violet-700 dark:text-[#d8b6ff]",
    border: "border-[#7a00ff]/32",
    bg: "bg-[#7a00ff]/10",
    glow: "shadow-[0_0_28px_-12px_rgba(122,0,255,0.72)]",
    fill: "bg-[#7a00ff]",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-400/35",
    bg: "bg-amber-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(251,191,36,0.85)]",
    fill: "bg-amber-400",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-300",
    border: "border-orange-400/35",
    bg: "bg-orange-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(251,146,60,0.85)]",
    fill: "bg-orange-400",
  },
  red: {
    text: "text-red-600 dark:text-red-300",
    border: "border-red-400/35",
    bg: "bg-red-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(248,113,113,0.8)]",
    fill: "bg-red-400",
  },
};

export const LENS_ICON_MAP: Record<string, LensIcon> = CANONICAL_LENS_ICON_MAP;

export function ListLensShell({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("listlens-shell-bg min-h-screen text-[color:var(--brand-text)]", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
      >
        <div className="absolute inset-0 circuit-board-bg" />
        <div className="absolute inset-0 scanlines opacity-40" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HudPanel({
  children,
  className,
  tone = "cyan",
}: HTMLAttributes<HTMLDivElement> & { tone?: HudTone }) {
  const toneClass = toneClasses[tone];
  return (
    <div
      className={cn(
        "hud-frame relative overflow-hidden rounded-[1.35rem] border bg-[color:var(--brand-card)]",
        "shadow-[inset_0_1px_0_var(--brand-card-inset),var(--brand-panel-shadow)] backdrop-blur-xl",
        toneClass.border,
        toneClass.glow,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-70",
          toneClass.text,
        )}
      />
      <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      {children}
    </div>
  );
}

export function LensOrb({
  icon: Icon,
  tone = "cyan",
  size = "md",
  label,
  className,
}: {
  icon: LensIcon;
  tone?: HudTone;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const toneClass = toneClasses[tone];
  const boxSize = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-11 w-11" : "h-14 w-14";
  const iconSize = size === "lg" ? 34 : size === "sm" ? 19 : 24;

  return (
    <div
      aria-label={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border",
        boxSize,
        toneClass.border,
        toneClass.bg,
        toneClass.text,
        toneClass.glow,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-1 rounded-full border border-current/15"
      />
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-full border border-current/10"
      />
      <Icon size={iconSize} strokeWidth={1.7} />
    </div>
  );
}

export function StatusPill({
  children,
  tone = "cyan",
  className,
}: HTMLAttributes<HTMLSpanElement> & { tone?: HudTone }) {
  const toneClass = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1",
        "font-mono-hud text-[10px] font-semibold uppercase tracking-[0.18em]",
        toneClass.border,
        toneClass.bg,
        toneClass.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", toneClass.fill)} />
      {children}
    </span>
  );
}

export function EvidenceStrip({ className }: { className?: string }) {
  const items = [
    { label: "AI-driven", icon: BrainCircuit },
    { label: "Real-time", icon: Zap },
    { label: "Trusted", icon: ShieldCheck },
    { label: "Evidence-first", icon: BadgeCheck },
    { label: "Connected", icon: Globe2 },
    { label: "Scalable", icon: BarChart3 },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 border-t border-[color:var(--brand-outline)] pt-4 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {items.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-[color:var(--brand-text)]"
        >
          <Icon size={17} strokeWidth={1.7} />
          <span className="font-mono-hud text-[10px] font-semibold uppercase tracking-[0.18em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BrandCartOrb({ className }: { className?: string }) {
  return (
    <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-[color:var(--brand-outline-strong)] bg-[color:var(--brand-nav-bg)] shadow-[0_30px_60px_-42px_rgba(0,130,255,0.6)] backdrop-blur-xl",
          className,
        )}
      >
      <span className="absolute inset-2 rounded-[1.5rem] border border-[color:var(--brand-outline)]" />
      <span className="absolute inset-5 rounded-[1rem] border border-[color:var(--brand-outline)]" />
      <BrandGlyph size={58} animated showSparks={false} />
    </div>
  );
}

export function ProductModeCard({
  tone,
  icon,
  title,
  label,
  body,
  cta,
  href,
}: {
  tone: HudTone;
  icon: LensIcon;
  title: string;
  label: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <HudPanel tone={tone} className="flex h-full flex-col p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <StatusPill tone={tone}>{label}</StatusPill>
        <LensOrb icon={icon} tone={tone} size="sm" />
      </div>
      <h3 className="text-2xl font-black tracking-tight text-[color:var(--brand-text-strong)]">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--brand-text-muted)]">{body}</p>
      <Link
        href={href}
        className={cn(
          "mt-6 inline-flex items-center justify-center rounded-md border px-4 py-3 text-sm font-bold transition",
          toneClasses[tone].border,
          toneClasses[tone].bg,
          toneClasses[tone].text,
          "hover:opacity-90",
        )}
      >
        {cta}
      </Link>
    </HudPanel>
  );
}

export function MiniEvidenceRow({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: string;
  tone?: HudTone;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[color:var(--brand-outline)] py-2.5 last:border-0">
      <span className="text-sm text-[color:var(--brand-text-muted)]">{label}</span>
      <span className={cn("font-mono-hud text-xs font-semibold", toneClasses[tone].text)}>
        {value}
      </span>
    </div>
  );
}

export function FileIconOrb({ tone = "cyan" }: { tone?: HudTone }) {
  return <LensOrb icon={FileText} tone={tone} size="sm" />;
}

export function CameraOrb({ tone = "cyan" }: { tone?: HudTone }) {
  return <LensOrb icon={Camera} tone={tone} size="sm" />;
}

export function ShieldOrb({ tone = "violet" }: { tone?: HudTone }) {
  return <LensOrb icon={ShieldCheck} tone={tone} size="sm" />;
}

export function CpuOrb({ tone = "blue" }: { tone?: HudTone }) {
  return <LensOrb icon={Cpu} tone={tone} size="sm" />;
}
