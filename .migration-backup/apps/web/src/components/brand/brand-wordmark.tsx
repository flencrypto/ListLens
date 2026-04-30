import { cn } from "@/lib/utils";

/**
 * BrandWordmark — the "MR.FLENS · LIST-LENS" lockup used in the navbar,
 * splash hero and footer. Pure SSR-friendly markup (no animation) so it can
 * be used inside server components.
 */
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
      ? "text-2xl"
      : "text-base";
  const sub =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "md"
      ? "text-sm"
      : "text-[10px]";
  const gap = size === "lg" ? "gap-2" : "gap-0.5";

  if (layout === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-baseline gap-2 font-extrabold tracking-tight",
          className,
        )}
      >
        <span
          className={cn(
            top,
            "bg-gradient-to-r from-[#3ea8ff] via-[#22d3ee] to-[#4ade80] bg-clip-text text-transparent",
          )}
        >
          MR.FLENS
        </span>
        <span
          className={cn(
            sub,
            "uppercase tracking-[0.25em] text-cyan-200/80 font-semibold",
          )}
        >
          List-LENS
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center", gap, className)}>
      <span
        className={cn(
          top,
          "font-extrabold tracking-tight bg-gradient-to-r from-[#3ea8ff] via-[#22d3ee] to-[#4ade80] bg-clip-text text-transparent",
          "drop-shadow-[0_0_24px_rgba(34,211,238,0.35)]",
        )}
      >
        MR.FLENS
      </span>
      <span
        className={cn(
          sub,
          "font-semibold uppercase tracking-[0.5em] text-cyan-200/80",
        )}
      >
        List-LENS
      </span>
    </span>
  );
}

export default BrandWordmark;
