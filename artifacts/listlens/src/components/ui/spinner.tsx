import { cn } from "@/lib/utils";

/**
 * HUD-style spinner — dual cyan ring with a soft glow, sized via `font-size`.
 *
 * Default size is 1em so it can be embedded inside text/buttons. Pass
 * `className="text-3xl text-cyan-300"` for a larger, recoloured spinner.
 *
 * The visual is implemented with pure CSS in `index.css` (.hud-spinner) so the
 * component itself is a single SSR-friendly span — no `motion`, no SVG.
 */
function Spinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("hud-spinner", className)}
      {...props}
    />
  );
}

export { Spinner };
