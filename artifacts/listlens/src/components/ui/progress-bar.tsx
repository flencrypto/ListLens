interface ProgressBarProps {
  /** 0–100 */
  value: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

/**
 * Thin branded progress bar — cyan→violet gradient fill.
 * Used for upload progress and AI analysis progress.
 */
export function ProgressBar({
  value,
  label,
  sublabel,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || sublabel) && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-zinc-300 font-medium">{label}</span>
          <span className="text-sm tabular-nums text-cyan-400 font-mono-hud">
            {sublabel ?? `${clamped}%`}
          </span>
        </div>
      )}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
