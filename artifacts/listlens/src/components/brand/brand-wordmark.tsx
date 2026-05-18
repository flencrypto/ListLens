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
          "inline-flex flex-col items-start gap-1",
          className,
        )}
      >
        <span
          className={cn(
            top,
            "font-brand-display neon-wordmark inline-flex items-baseline gap-[0.04em] font-black uppercase leading-none tracking-[0.08em] text-[color:var(--brand-text-strong)]",
          )}
        >
          <span className="-mr-[0.04em] skew-x-[-12deg]">LIST-</span>
          <span className="brand-wordmark-accent skew-x-[-12deg]">LENS</span>
        </span>
        <span
          className={cn(
            sub,
            "brand-page-eyebrow text-[color:var(--brand-text-muted)]",
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
          "font-brand-display neon-wordmark inline-flex items-baseline gap-[0.04em] font-black uppercase leading-none tracking-[0.08em] text-[color:var(--brand-text-strong)]",
        )}
      >
        <span className="-mr-[0.04em] skew-x-[-12deg]">LIST-</span>
        <span className="brand-wordmark-accent skew-x-[-12deg]">LENS</span>
      </span>
      <span
        className={cn(
          sub,
          "brand-page-eyebrow text-[color:var(--brand-text-muted)]",
        )}
      >
        AI-powered marketplace intelligence
      </span>
    </span>
  );
}

export default BrandWordmark;
