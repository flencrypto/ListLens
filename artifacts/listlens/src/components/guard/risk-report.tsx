import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { GuardOutput } from "@/lib/ai/schemas";

const RISK_COLORS = {
  low: { badge: "success", bar: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", bg: "bg-emerald-950/20" },
  medium: { badge: "warning", bar: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30", bg: "bg-amber-950/20" },
  medium_high: { badge: "warning", bar: "bg-orange-500", text: "text-orange-400", ring: "ring-orange-500/30", bg: "bg-orange-950/20" },
  high: { badge: "destructive", bar: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30", bg: "bg-red-950/20" },
  inconclusive: { badge: "secondary", bar: "bg-zinc-500", text: "text-zinc-400", ring: "ring-zinc-500/30", bg: "bg-zinc-900/40" },
} as const;

const BUY_RECOMMENDATION = {
  proceed: { label: "Proceed", icon: "✓", color: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-800/50" },
  proceed_with_caution: { label: "Proceed with Caution", icon: "⚠", color: "text-amber-400", bg: "bg-amber-950/25", border: "border-amber-800/50" },
  ask_questions_first: { label: "Ask Questions First", icon: "?", color: "text-orange-400", bg: "bg-orange-950/25", border: "border-orange-800/50" },
  avoid: { label: "Avoid", icon: "✕", color: "text-red-400", bg: "bg-red-950/25", border: "border-red-900/50" },
} as const;

const PRICE_VERDICTS = {
  fair: { label: "Fair Price", color: "text-emerald-400" },
  low_risk_deal: { label: "Good Deal", color: "text-cyan-400" },
  suspiciously_low: { label: "Suspiciously Low", color: "text-red-400" },
  overpriced: { label: "Overpriced", color: "text-amber-400" },
  unknown: { label: "Price Unknown", color: "text-zinc-400" },
} as const;

const AUTHENTICITY_VERDICT_ICONS = {
  pass: { icon: "✓", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40" },
  fail: { icon: "✕", color: "text-red-400 bg-red-950/30 border-red-900/40" },
  unclear: { icon: "?", color: "text-zinc-400 bg-zinc-900/50 border-zinc-700/40" },
} as const;

const AUTH_SERVICES = [
  {
    name: "PSA/DNA",
    description: "Professional Sports Authenticator — industry-standard autograph grading & encapsulation.",
    url: "https://www.psacard.com/autographservices",
  },
  {
    name: "Beckett BAS",
    description: "Beckett Authentication Services — trusted grading for sports & entertainment autographs.",
    url: "https://www.beckett.com/autograph-authentication",
  },
  {
    name: "JSA",
    description: "James Spence Authentication — specialist in celebrity, sports & historical autographs.",
    url: "https://www.jsa.cc/authentication",
  },
  {
    name: "AFTAL",
    description: "Autograph Fair Trading Association Ltd — UK-based approved autograph dealers & authenticators.",
    url: "https://aftal.co.uk/category/authenticators/",
  },
] as const;

const DIMENSION_LABELS = {
  price: "Price",
  photos: "Photos",
  listing_quality: "Listing Quality",
  item_authenticity: "Item Authenticity",
  seller_signals: "Seller Signals",
} as const;

function ScoreBar({ score, label, verdict }: { score: number; label: string; verdict: string }) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : score >= 3 ? "bg-orange-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <span className={`text-xs font-mono ${score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400"}`}>
          {score}/10
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 leading-tight">{verdict}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-auto shrink-0 text-xs text-zinc-600 hover:text-cyan-400 transition-colors px-2 py-0.5 rounded border border-transparent hover:border-zinc-700"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

interface RiskReportProps {
  report: GuardOutput;
}

export function RiskReport({ report }: RiskReportProps) {
  const riskStyle = RISK_COLORS[report.risk.level];
  const buyRec = BUY_RECOMMENDATION[report.buy_recommendation.verdict];

  const highFlags = report.red_flags.filter((f) => f.severity === "high");
  const medFlags = report.red_flags.filter((f) => f.severity === "medium");
  const lowFlags = report.red_flags.filter((f) => f.severity === "low");

  const priceStyle = PRICE_VERDICTS[report.price_analysis.price_verdict];

  const overallScore = Math.round(
    (Object.values(report.risk_dimensions).reduce((sum, d) => sum + d.score, 0) /
      Object.values(report.risk_dimensions).length) * 10
  ) / 10;

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className={`brand-card brand-card-violet p-0 overflow-hidden ring-1 ${riskStyle.ring}`}>
        <div className="px-5 py-2.5 border-b border-violet-500/15 flex items-center gap-2">
          <span className="font-mono-hud text-[10px] tracking-[0.25em] uppercase text-violet-300">
            Guard · Risk Report
          </span>
          <span className="ml-auto font-mono-hud text-[9px] tracking-widest uppercase text-violet-300/40">
            {report.lens}
          </span>
        </div>

        <div className="px-5 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={riskStyle.badge as "success" | "warning" | "destructive" | "secondary"} className="text-sm px-3 py-0.5">
                {report.risk.level.replace("_", " ").toUpperCase()}
              </Badge>
              <span className="text-zinc-500 text-sm">
                {Math.round(report.risk.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-lg">
              {report.risk.summary}
            </p>
          </div>
          <div className={`rounded-xl border ${riskStyle.ring.replace("ring-", "border-").replace("/30", "/60")} ${riskStyle.bg} px-4 py-3 text-center shrink-0`}>
            <div className={`text-3xl font-extrabold font-mono ${riskStyle.text}`}>{overallScore}</div>
            <div className="text-xs text-zinc-500 mt-0.5">risk score /10</div>
          </div>
        </div>
      </div>

      {/* ── Buy Recommendation ───────────────────────────────────────────── */}
      <div className={`rounded-xl border ${buyRec.border} ${buyRec.bg} px-5 py-4 flex items-start gap-4`}>
        <div className={`text-2xl font-bold ${buyRec.color} shrink-0 w-8 text-center`}>{buyRec.icon}</div>
        <div>
          <p className={`font-bold text-base ${buyRec.color} mb-1`}>{buyRec.label}</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{report.buy_recommendation.reasoning}</p>
        </div>
      </div>

      {/* ── Risk Scorecard ───────────────────────────────────────────────── */}
      <div className="brand-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-violet-500 rounded-full" />
          Risk Scorecard
        </h2>
        <div className="space-y-4">
          {(Object.entries(report.risk_dimensions) as [keyof typeof DIMENSION_LABELS, { score: number; verdict: string }][]).map(
            ([key, dim]) => (
              <ScoreBar key={key} score={dim.score} label={DIMENSION_LABELS[key]} verdict={dim.verdict} />
            )
          )}
        </div>
      </div>

      {/* ── Price Analysis ───────────────────────────────────────────────── */}
      <div className="brand-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-cyan-500 rounded-full" />
          Price Analysis
        </h2>
        <div className="flex flex-wrap gap-4 mb-3">
          {report.price_analysis.asking_price && (
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Asking price</p>
              <p className="text-lg font-bold text-white">{report.price_analysis.asking_price}</p>
            </div>
          )}
          {report.price_analysis.market_estimate && (
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Market estimate</p>
              <p className="text-lg font-bold text-zinc-300">{report.price_analysis.market_estimate}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Verdict</p>
            <p className={`text-sm font-semibold ${priceStyle.color}`}>{priceStyle.label}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{report.price_analysis.price_note}</p>
      </div>

      {/* ── Red Flags + Green Signals ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Red Flags */}
        {report.red_flags.length > 0 && (
          <div className="brand-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-red-500 rounded-full" />
              Red Flags
              <span className="ml-auto text-xs text-zinc-600">{report.red_flags.length}</span>
            </h2>
            <div className="space-y-3">
              {[...highFlags, ...medFlags, ...lowFlags].map((flag, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge
                    variant={flag.severity === "high" ? "destructive" : flag.severity === "medium" ? "warning" : "secondary"}
                    className="mt-0.5 shrink-0 text-[10px] px-1.5"
                  >
                    {flag.severity}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">
                      {flag.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-zinc-300 leading-snug">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Green Signals */}
        {report.green_signals.length > 0 && (
          <div className="brand-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-emerald-500 rounded-full" />
              Positive Signals
              <span className="ml-auto text-xs text-zinc-600">{report.green_signals.length}</span>
            </h2>
            <div className="space-y-3">
              {report.green_signals.map((sig, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-emerald-400 shrink-0 text-sm font-bold mt-0.5">✓</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">
                      {sig.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-zinc-300 leading-snug">{sig.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Authenticity Markers ─────────────────────────────────────────── */}
      {report.authenticity_signals.length > 0 && (
        <div className="brand-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-amber-500 rounded-full" />
            Authenticity Check
          </h2>
          <div className="space-y-2">
            {report.authenticity_signals.map((sig, i) => {
              const vs = AUTHENTICITY_VERDICT_ICONS[sig.verdict];
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border shrink-0 mt-0.5 ${vs.color}`}>
                    {vs.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-300">{sig.marker}</p>
                    <p className="text-xs text-zinc-500 leading-snug">{sig.observed}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800/60">
            {(["pass", "fail", "unclear"] as const).map((v) => {
              const count = report.authenticity_signals.filter((s) => s.verdict === v).length;
              return (
                <div key={v} className="flex items-center gap-1.5">
                  <span className={`text-xs ${AUTHENTICITY_VERDICT_ICONS[v].color.split(" ")[0]}`}>
                    {AUTHENTICITY_VERDICT_ICONS[v].icon}
                  </span>
                  <span className="text-xs text-zinc-500">{count} {v}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Questions to Ask Seller ───────────────────────────────────────── */}
      {report.seller_questions.length > 0 && (
        <div className="brand-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-violet-500 rounded-full" />
            Questions to Ask the Seller
          </h2>
          <ol className="space-y-2.5">
            {report.seller_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300 rounded-lg bg-zinc-900/50 border border-zinc-800/60 px-3 py-2.5">
                <span className="font-mono-hud text-[10px] text-violet-400 w-4 shrink-0 mt-0.5">{i + 1}.</span>
                <span className="flex-1 leading-snug">{q}</span>
                <CopyButton text={q} />
              </li>
            ))}
          </ol>
          <button
            className="mt-3 text-xs text-zinc-600 hover:text-cyan-400 transition-colors underline underline-offset-2"
            onClick={() => {
              void navigator.clipboard.writeText(report.seller_questions.join("\n"));
            }}
          >
            Copy all questions
          </button>
        </div>
      )}

      {/* ── Missing Photos ───────────────────────────────────────────────── */}
      {report.missing_photos.length > 0 && (
        <div className="brand-card p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-zinc-500 rounded-full" />
            Photos to Request
          </h2>
          <ul className="space-y-1.5">
            {report.missing_photos.map((p, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className="text-zinc-600 shrink-0">•</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Third-party Authentication ───────────────────────────────────── */}
      {report.lens === "AutographLens" && (report.risk.level === "medium_high" || report.risk.level === "high") && (
        <div className="brand-card p-5 ring-1 ring-red-500/30">
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-red-500 rounded-full" />
            Get it authenticated
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            The risk level on this autograph is elevated. Consider submitting the item to a recognised third-party authentication service before buying.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {AUTH_SERVICES.map((svc) => (
              <a
                key={svc.name}
                href={svc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/50 hover:border-red-500/40 hover:bg-red-950/20 transition-colors px-4 py-3 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{svc.name}</p>
                  <p className="text-xs text-zinc-500 leading-snug mt-0.5">{svc.description}</p>
                </div>
                <span className="text-zinc-600 group-hover:text-red-400 transition-colors shrink-0 mt-0.5">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-zinc-600 pb-2">{report.disclaimer}</p>
    </div>
  );
}
