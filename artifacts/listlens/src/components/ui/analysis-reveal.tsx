import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnalysisRevealProps {
  variant: "guard" | "studio";
  onDone: () => void;
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 4L8 10v12c0 10.5 6.5 19.5 16 22 9.5-2.5 16-11.5 16-22V10L24 4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M17 24l5 5 9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LensIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <line x1="34" y1="34" x2="42" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="24" y1="40" x2="24" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function AnalysisReveal({ variant, onDone }: AnalysisRevealProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  const isGuard = variant === "guard";
  const accentColor = isGuard ? "text-violet-400" : "text-cyan-400";
  const glowColor = isGuard
    ? "rgba(139,92,246,0.35)"
    : "rgba(34,211,238,0.35)";
  const ringColor = isGuard ? "#8b5cf6" : "#22d3ee";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 1100);
    const t3 = setTimeout(() => onDone(), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950",
        "analysis-reveal-overlay",
        phase === "out" && "analysis-reveal-out"
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${glowColor}, transparent 70%)`,
        }}
      />

      <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />

      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="absolute analysis-reveal-ring"
            width="120"
            height="120"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={ringColor}
              strokeWidth="1.5"
              strokeDasharray="8 6"
              opacity="0.5"
            />
          </svg>
          <svg
            viewBox="0 0 120 120"
            className="absolute analysis-reveal-ring-fast"
            width="120"
            height="120"
          >
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={ringColor}
              strokeWidth="1"
              strokeDasharray="3 12"
              opacity="0.3"
            />
          </svg>

          <div
            className={cn("w-16 h-16 analysis-reveal-icon", accentColor)}
            style={{
              filter: `drop-shadow(0 0 18px ${ringColor})`,
            }}
          >
            {isGuard ? (
              <ShieldIcon className="w-full h-full" />
            ) : (
              <LensIcon className="w-full h-full" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p
            className={cn(
              "font-mono-hud text-[11px] tracking-[0.3em] uppercase analysis-reveal-label",
              accentColor
            )}
          >
            {isGuard ? "Guard · Analysis Complete" : "Studio · Analysis Complete"}
          </p>
          <div className="hud-divider w-40" />
        </div>
      </div>
    </div>
  );
}
