import { cn } from "@/lib/utils";

/**
 * BrandBackground — the deep navy / cyan / amber atmospheric backdrop used
 * across the splash, hero and any branded page. SSR-safe (no animation) — the
 * BrandLens component supplies the motion layer on top.
 *
 * Layers (back → front):
 *   1. Deep navy base
 *   2. Three large coloured glow blooms (cyan top, green left, amber right)
 *   3. A subtle directional cyan top-light to give the page lift
 *   4. A faint cyan grid, masked to a centre ellipse so edges fade out
 *   5. Soft scanlines for HUD texture
 *   6. Vignette
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
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[color:var(--brand-shell-top)] blur-[140px]" />
      <div className="absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full bg-[color:var(--brand-shell-right)] blur-[140px]" />
      <div className="absolute bottom-0 -right-40 h-[520px] w-[520px] rounded-full bg-[color:var(--brand-shell-bottom)] blur-[140px]" />
      <div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, color-mix(in srgb, var(--brand-blue) 22%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--brand-blue) 36%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--brand-blue) 36%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, color-mix(in srgb, var(--brand-cyan) 12%, transparent) 0px, color-mix(in srgb, var(--brand-cyan) 12%, transparent) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_32%,_rgba(4,10,20,0.16)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.62)_100%)]" />
    </div>
  );
}

export default BrandBackground;
