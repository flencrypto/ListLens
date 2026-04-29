import { cn } from "@/lib/utils";

/**
 * BrandBackground — the deep navy / cyan / amber atmospheric backdrop used
 * across the splash, hero and any branded page. SSR-safe (no animation) — the
 * BrandLens component supplies the motion layer on top.
 */
export function BrandBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Deep navy base, matching the brand artwork */}
      <div className="absolute inset-0 bg-[#040a14]" />
      {/* Cyan top glow */}
      <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#22d3ee]/15 blur-[140px]" />
      {/* Green left glow */}
      <div className="absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full bg-[#4ade80]/10 blur-[140px]" />
      {/* Amber right glow */}
      <div className="absolute bottom-0 -right-40 h-[520px] w-[520px] rounded-full bg-[#fb923c]/10 blur-[140px]" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

export default BrandBackground;
