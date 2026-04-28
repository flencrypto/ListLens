import * as React from "react";
import { cn } from "./cn";

export interface ConfidenceMeterProps {
  value: number;
  label?: string;
  className?: string;
}

export function ConfidenceMeter({ value, label, className }: ConfidenceMeterProps) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className={cn("space-y-1", className)}>
      {label && <p className="text-xs text-white/60">{label}</p>}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Confidence: ${pct}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className={cn("h-full transition-[width] duration-500 ease-out motion-reduce:transition-none", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs font-medium text-white/60">{pct}%</p>
    </div>
  );
}
