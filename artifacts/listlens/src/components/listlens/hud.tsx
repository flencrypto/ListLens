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
    text: "text-cyan-300",
    border: "border-cyan-400/35",
    bg: "bg-cyan-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(34,211,238,0.9)]",
    fill: "bg-cyan-400",
  },
  blue: {
    text: "text-blue-300",
    border: "border-blue-400/35",
    bg: "bg-blue-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(62,168,255,0.9)]",
    fill: "bg-blue-400",
  },
  green: {
    text: "text-emerald-300",
    border: "border-emerald-400/35",
    bg: "bg-emerald-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(74,222,128,0.9)]",
    fill: "bg-emerald-400",
  },
  violet: {
    text: "text-violet-300",
    border: "border-violet-400/35",
    bg: "bg-violet-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(139,92,246,0.9)]",
    fill: "bg-violet-400",
  },
  amber: {
    text: "text-amber-300",
    border: "border-amber-400/35",
    bg: "bg-amber-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(251,191,36,0.85)]",
    fill: "bg-amber-400",
  },
  orange: {
    text: "text-orange-300",
    border: "border-orange-400/35",
    bg: "bg-orange-400/10",
    glow: "shadow-[0_0_28px_-12px_rgba(251,146,60,0.85)]",
    fill: "bg-orange-400",
  },
  red: {
    text: "text-red-300",
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
    <div className={cn("listlens-shell-bg min-h-screen text-slate-100", className)}>
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
        "hud-frame relative overflow-hidden rounded-lg border bg-[#061120]/82",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
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
        "grid grid-cols-2 gap-2 border-t border-cyan-400/15 pt-4 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {items.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-cyan-300/85"
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
        "relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_48px_-16px_rgba(34,211,238,0.9)]",
        className,
      )}
    >
      <span className="absolute inset-2 rounded-full border border-cyan-300/10" />
      <span className="absolute inset-5 rounded-full border border-cyan-300/10" />
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
      <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{body}</p>
      <Link
        href={href}
        className={cn(
          "mt-6 inline-flex items-center justify-center rounded-md border px-4 py-3 text-sm font-bold transition",
          toneClasses[tone].border,
          toneClasses[tone].bg,
          toneClasses[tone].text,
          "hover:bg-white/10 hover:text-white",
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
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
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
