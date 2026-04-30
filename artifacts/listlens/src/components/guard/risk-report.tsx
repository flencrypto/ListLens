
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GuardOutput } from "@/lib/ai/schemas";

const riskColors = {
  low: "success",
  medium: "warning",
  medium_high: "warning",
  high: "destructive",
  inconclusive: "secondary",
} as const;

interface RiskReportProps {
  report: GuardOutput;
}

export function RiskReport({ report }: RiskReportProps) {
  return (
    <div className="space-y-6">
      <div className="brand-card brand-card-violet p-0 overflow-hidden">
        <div className="px-6 py-3 border-b border-violet-500/15 flex items-center gap-2">
          <span className="font-mono-hud text-[10px] tracking-[0.25em] uppercase text-violet-300">
            Guard · Risk Report
          </span>
          <span className="ml-auto font-mono-hud text-[10px] tracking-[0.25em] uppercase text-violet-200/70">
            v1.0
          </span>
        </div>
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Risk Assessment
              <Badge variant={riskColors[report.risk.level]}>
                {report.risk.level.replace("_", " ").toUpperCase()}
              </Badge>
              <span className="text-zinc-500 text-sm font-normal">
                {Math.round(report.risk.confidence * 100)}% confidence
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-xs">{report.disclaimer}</p>
          </CardContent>
        </Card>
      </div>

      {report.red_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Red Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.red_flags.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Badge
                    variant={f.severity === "high" ? "destructive" : f.severity === "medium" ? "warning" : "secondary"}
                    className="mt-0.5 shrink-0"
                  >
                    {f.severity}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{f.type.replace("_", " ")}</p>
                    <p className="text-sm text-zinc-400">{f.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.seller_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions to Ask Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              {report.seller_questions.map((q, i) => (
                <li key={i} className="text-zinc-300 text-sm">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {report.missing_photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {report.missing_photos.map((p, i) => (
                <li key={i} className="text-zinc-400 text-sm">• {p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
