import * as React from "react";
import { cn } from "./cn";

export type RiskLevel = "low" | "medium" | "medium_high" | "high" | "inconclusive";

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-400", label: "Low Risk" },
  medium: { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-400", label: "Medium Risk" },
  medium_high: { bg: "bg-orange-500/20 border-orange-500/40", text: "text-orange-400", label: "Medium-High Risk" },
  high: { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", label: "High Risk" },
  inconclusive: { bg: "bg-slate-500/20 border-slate-500/40", text: "text-slate-400", label: "Inconclusive" },
};

export interface RiskLevelBadgeProps {
  level: RiskLevel;
  confidence?: number;
  className?: string;
}

export function RiskLevelBadge({ level, confidence, className }: RiskLevelBadgeProps) {
  const style = RISK_STYLES[level];
  return (
    <div
      role="status"
      aria-label={`Risk level: ${style.label}${confidence !== undefined ? `, confidence ${Math.round(confidence * 100)}%` : ""}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {style.label}
      {confidence !== undefined && (
        <span className="text-xs opacity-75">{Math.round(confidence * 100)}%</span>
      )}
    </div>
  );
}
