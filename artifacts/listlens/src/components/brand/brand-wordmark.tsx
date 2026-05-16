import { cn } from "@/lib/utils";

export interface BrandWordmarkProps {
  /** "stacked" mirrors the splash hero, "inline" is the navbar lockup. */
  layout?: "stacked" | "inline";
  /** Visual scale: small (nav), md (default), lg (hero). */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandWordmark({
  layout = "inline",
  size = "md",
  className,
}: BrandWordmarkProps) {
  const top =
    size === "lg"
      ? "text-5xl sm:text-7xl"
      : size === "md"
      ? "text-3xl"
      : "text-xl";
  const sub =
    size === "lg"
      ? "text-sm sm:text-base"
      : size === "md"
      ? "text-[11px]"
      : "text-[8px]";
  const gap = size === "lg" ? "gap-2" : "gap-0.5";

  if (layout === "inline") {
    return (
      <span
        className={cn(
          "inline-flex flex-col items-start gap-0.5 font-extrabold",
          className,
        )}
      >
        <span
          className={cn(
            top,
            "neon-wordmark font-black uppercase leading-none text-white",
          )}
        >
          LIST-<span className="text-cyan-300">LENS</span>
        </span>
        <span
          className={cn(
            sub,
            "font-mono-hud uppercase tracking-[0.32em] text-cyan-200/80 font-semibold",
          )}
        >
          AI-powered marketplace intelligence
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center", gap, className)}>
      <span
        className={cn(
          top,
          "neon-wordmark font-black uppercase leading-none text-white",
          "drop-shadow-[0_0_24px_rgba(34,211,238,0.35)]",
        )}
      >
        LIST-<span className="text-cyan-300">LENS</span>
      </span>
      <span
        className={cn(
          sub,
          "font-mono-hud font-semibold uppercase tracking-[0.5em] text-cyan-200/80",
        )}
      >
        AI-powered marketplace intelligence
      </span>
    </span>
  );
}

export default BrandWordmark;
