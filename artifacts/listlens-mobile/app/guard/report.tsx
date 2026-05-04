import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Linking, Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GuardCheckButton } from "@/components/ui/GuardCheckButton";
import { AnalysisReveal } from "@/components/ui/AnalysisReveal";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import {
  getReport,
  saveReport,
  type GuardReport,
  type RiskLevel,
} from "@/lib/historyStore";
import { getGuardCheck, type GuardApiReport } from "@/lib/api";

function apiReportToLocalReport(
  id: string,
  apiReport: GuardApiReport,
  meta: { createdAt: string | null; url: string | null; screenshotUrls: string[] },
): GuardReport {
  return {
    id,
    createdAt: meta.createdAt ? new Date(meta.createdAt).getTime() : Date.now(),
    lens: apiReport.lens,
    source: (meta.screenshotUrls?.length ?? 0) > 0 ? "screenshots" : "url",
    url: meta.url ?? "",
    shots: meta.screenshotUrls ?? [],
    saved: true,
    risk: apiReport.risk,
    risk_dimensions: apiReport.risk_dimensions,
    red_flags: apiReport.red_flags,
    green_signals: apiReport.green_signals,
    price_analysis: {
      asking_price: apiReport.price_analysis.asking_price,
      market_estimate: apiReport.price_analysis.market_estimate,
      price_verdict: apiReport.price_analysis.price_verdict,
      price_note: apiReport.price_analysis.price_note,
    },
    authenticity_signals: apiReport.authenticity_signals,
    missing_photos: apiReport.missing_photos,
    seller_questions: apiReport.seller_questions,
    buy_recommendation: apiReport.buy_recommendation,
  };
}

const AUTH_SERVICES = [
  {
    name: "PSA/DNA",
    description: "Industry-standard autograph grading & encapsulation.",
    url: "https://www.psacard.com/autographservices",
  },
  {
    name: "Beckett BAS",
    description: "Trusted grading for sports & entertainment autographs.",
    url: "https://www.beckett.com/autograph-authentication",
  },
  {
    name: "JSA",
    description: "Specialist in celebrity, sports & historical autographs.",
    url: "https://www.jsa.cc/authentication",
  },
  {
    name: "AFTAL",
    description: "UK-based approved autograph dealers & authenticators.",
    url: "https://aftal.co.uk/category/authenticators/",
  },
] as const;

const RISK_COLORS: Record<RiskLevel, { color: string; bg: string; border: string; badge: "red" | "amber" | "emerald" | "neutral" }> = {
  low: { color: "#34d399", bg: "rgba(6,78,59,0.25)", border: "rgba(52,211,153,0.35)", badge: "emerald" },
  medium: { color: "#fbbf24", bg: "rgba(92,64,0,0.25)", border: "rgba(251,191,36,0.35)", badge: "amber" },
  medium_high: { color: "#f97316", bg: "rgba(124,45,18,0.25)", border: "rgba(249,115,22,0.35)", badge: "amber" },
  high: { color: "#f87171", bg: "rgba(127,29,29,0.25)", border: "rgba(248,113,113,0.35)", badge: "red" },
  inconclusive: { color: "#a1a1aa", bg: "rgba(39,39,42,0.4)", border: "rgba(161,161,170,0.25)", badge: "neutral" },
};

const BUY_REC_STYLES = {
  proceed: { label: "Proceed", icon: "check-circle" as const, color: "#34d399", bg: "rgba(6,78,59,0.25)", border: "rgba(52,211,153,0.3)" },
  proceed_with_caution: { label: "Proceed with Caution", icon: "alert-circle" as const, color: "#fbbf24", bg: "rgba(92,64,0,0.25)", border: "rgba(251,191,36,0.3)" },
  ask_questions_first: { label: "Ask Questions First", icon: "help-circle" as const, color: "#fb923c", bg: "rgba(124,45,18,0.25)", border: "rgba(249,115,22,0.3)" },
  avoid: { label: "Avoid", icon: "x-circle" as const, color: "#f87171", bg: "rgba(127,29,29,0.25)", border: "rgba(248,113,113,0.3)" },
};

const PRICE_VERDICT_LABELS: Record<string, { label: string; color: string }> = {
  fair: { label: "Fair Price", color: "#34d399" },
  low_risk_deal: { label: "Good Deal", color: "#22d3ee" },
  suspiciously_low: { label: "Suspiciously Low", color: "#f87171" },
  overpriced: { label: "Overpriced", color: "#fbbf24" },
  unknown: { label: "Price Unknown", color: "#a1a1aa" },
};

const DIMENSION_LABELS: Record<string, string> = {
  price: "Price",
  photos: "Photos",
  listing_quality: "Listing Quality",
  item_authenticity: "Item Authenticity",
  seller_signals: "Seller Signals",
};

function scoreColor(score: number, colors: ReturnType<typeof useColors>): string {
  if (score >= 8) return colors.emerald400;
  if (score >= 5) return colors.amber400;
  return colors.red500;
}

function ScoreBar({
  label,
  score,
  verdict,
  colors,
}: {
  label: string;
  score: number;
  verdict: string;
  colors: ReturnType<typeof useColors>;
}) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 8 ? colors.emerald400 : score >= 5 ? colors.amber400 : colors.red500;
  const barBg = score >= 8 ? "rgba(52,211,153,0.85)" : score >= 5 ? "rgba(251,191,36,0.85)" : "rgba(248,113,113,0.85)";
  return (
    <View style={{ gap: 4 }}>
      <View style={styles.scoreDimRow}>
        <Text style={[styles.dimLabel, { color: colors.zinc300 }]}>{label}</Text>
        <Text style={[styles.dimScore, { color }]}>{score}/10</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.zinc800 }]}>
        <View style={[styles.barFill, { width: `${pct}%` as DimensionValue, backgroundColor: barBg }]} />
      </View>
      <Text style={[styles.dimVerdict, { color: colors.zinc500 }]}>{verdict}</Text>
    </View>
  );
}

export default function GuardReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{
    lens?: string;
    source?: string;
    url?: string;
    shots?: string;
    reportId?: string;
    fresh?: string;
  }>();

  const isFresh = params.fresh === "1";
  const [showReveal, setShowReveal] = useState(false);
  const contentAnim = useRef(new Animated.Value(isFresh ? 0 : 1)).current;
  const contentTranslate = useRef(new Animated.Value(isFresh ? 18 : 0)).current;

  const [report, setReport] = useState<GuardReport | null>(null);
  const initialised = useRef(false);
  const revealTriggered = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const incomingId = params.reportId ? String(params.reportId) : null;
      if (incomingId) {
        const existing = await getReport(incomingId);
        if (cancelled) return;
        if (existing) {
          setReport(existing);
          initialised.current = true;
          return;
        }
        // Not in local storage — fetch from the API (handles cross-device / cleared-cache case)
        try {
          const { report: apiReport, createdAt, url, screenshotUrls } = await getGuardCheck(incomingId);
          if (cancelled) return;
          const localReport = apiReportToLocalReport(incomingId, apiReport, { createdAt, url, screenshotUrls });
          await saveReport(localReport).catch(() => undefined);
          setReport(localReport);
          initialised.current = true;
          return;
        } catch {
          // API unavailable — fall through to "not found"
          if (cancelled) return;
        }
      }
      // No matching report found in local storage or API
      if (cancelled) return;
      initialised.current = true;
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.reportId]);

  useEffect(() => {
    if (!initialised.current || !report) return;
    saveReport(report).catch(() => undefined);
  }, [report]);

  // Trigger reveal once the report is loaded and this is a fresh analysis
  useEffect(() => {
    if (!report || !isFresh || revealTriggered.current) return;
    revealTriggered.current = true;
    setShowReveal(true);
  }, [report, isFresh]);

  function handleRevealDone() {
    setShowReveal(false);
    Animated.parallel([
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }

  if (!report) {
    const notFound = initialised.current;
    return (
      <ScreenContainer>
        <View style={{ paddingHorizontal: 4, gap: 8 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Risk report</Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            {notFound ? "Report not found." : "Loading…"}
          </Text>
          {notFound && (
            <Pressable onPress={() => router.replace("/guard/check")} hitSlop={12} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.cyan300, fontFamily: "Inter_500Medium", fontSize: 14 }}>
                ← Run a new check
              </Text>
            </Pressable>
          )}
        </View>
      </ScreenContainer>
    );
  }

  const level = report.risk.level;
  const riskStyle = RISK_COLORS[level] ?? RISK_COLORS.inconclusive;
  const buyRec = BUY_REC_STYLES[report.buy_recommendation.verdict] ?? BUY_REC_STYLES.proceed_with_caution;
  const priceVerdict = PRICE_VERDICT_LABELS[report.price_analysis.price_verdict] ?? PRICE_VERDICT_LABELS.unknown;

  const overallScore =
    Math.round(
      (Object.values(report.risk_dimensions).reduce((s, d) => s + d.score, 0) /
        Object.values(report.risk_dimensions).length) * 10,
    ) / 10;

  const highFlags = report.red_flags.filter((f) => f.severity === "high");
  const medFlags = report.red_flags.filter((f) => f.severity === "medium");
  const lowFlags = report.red_flags.filter((f) => f.severity === "low");
  const sortedFlags = [...highFlags, ...medFlags, ...lowFlags];

  const authPass = report.authenticity_signals.filter((s) => s.verdict === "pass").length;
  const authFail = report.authenticity_signals.filter((s) => s.verdict === "fail").length;
  const authUnclear = report.authenticity_signals.filter((s) => s.verdict === "unclear").length;

  return (
    <>
      {showReveal && <AnalysisReveal variant="guard" onDone={handleRevealDone} />}
      <ScreenContainer>
      <Animated.View
        style={{
          gap: 16,
          opacity: contentAnim,
          transform: [{ translateY: contentTranslate }],
        }}
      >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Risk report</Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            {report.lens} · {report.source === "screenshots" ? "Screenshots" : "Listing URL"}
          </Text>
        </View>
        <Badge label={`${level.replace("_", " ")} risk`} tone={riskStyle.badge} />
      </View>

      {/* Overall risk card */}
      <Card highlight>
        <View style={styles.riskRow}>
          <View style={[styles.riskDot, { backgroundColor: riskStyle.bg, borderColor: riskStyle.color }]}>
            <Text style={[styles.riskLevel, { color: riskStyle.color }]}>
              {level.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.riskMetaRow}>
              <Text style={[styles.riskMetaLabel, { color: colors.zinc400 }]}>Overall score</Text>
              <Text style={[styles.riskMetaValue, { color: scoreColor(overallScore, colors) }]}>
                {overallScore}/10
              </Text>
              <Text style={[styles.riskMetaLabel, { color: colors.zinc400 }]}>
                · {Math.round(report.risk.confidence * 100)}% confidence
              </Text>
            </View>
            <Text style={[styles.riskSummary, { color: colors.foreground }]}>
              {report.risk.summary}
            </Text>
          </View>
        </View>
      </Card>

      {/* Buy recommendation */}
      <Card>
        <View style={[styles.buyRecCard, { backgroundColor: buyRec.bg, borderColor: buyRec.border }]}>
          <View style={styles.buyRecHeader}>
            <Feather name={buyRec.icon} size={20} color={buyRec.color} />
            <Text style={[styles.buyRecLabel, { color: buyRec.color }]}>{buyRec.label}</Text>
          </View>
          <Text style={[styles.buyRecReasoning, { color: colors.zinc300 }]}>
            {report.buy_recommendation.reasoning}
          </Text>
        </View>
      </Card>

      {/* Risk scorecard */}
      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Risk Scorecard</Text>
        <View style={{ gap: 14 }}>
          {(Object.entries(report.risk_dimensions) as [string, { score: number; verdict: string }][]).map(
            ([key, dim]) => (
              <ScoreBar
                key={key}
                label={DIMENSION_LABELS[key] ?? key}
                score={dim.score}
                verdict={dim.verdict}
                colors={colors}
              />
            ),
          )}
        </View>
      </Card>

      {/* Price analysis */}
      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Price Analysis</Text>
        <View style={styles.priceRow}>
          {report.price_analysis.asking_price && (
            <View style={styles.priceCell}>
              <Text style={[styles.priceCellLabel, { color: colors.zinc500 }]}>Asking</Text>
              <Text style={[styles.priceCellValue, { color: colors.foreground }]}>
                {report.price_analysis.asking_price}
              </Text>
            </View>
          )}
          {report.price_analysis.market_estimate && (
            <View style={styles.priceCell}>
              <Text style={[styles.priceCellLabel, { color: colors.zinc500 }]}>Market</Text>
              <Text style={[styles.priceCellValue, { color: colors.zinc300 }]}>
                {report.price_analysis.market_estimate}
              </Text>
            </View>
          )}
          <View style={styles.priceCell}>
            <Text style={[styles.priceCellLabel, { color: colors.zinc500 }]}>Verdict</Text>
            <Text style={[styles.priceCellVerdict, { color: priceVerdict.color }]}>
              {priceVerdict.label}
            </Text>
          </View>
        </View>
        {report.price_analysis.market_data && (
          <View style={[styles.marketDataRow, { borderColor: "rgba(34,211,238,0.25)", backgroundColor: "rgba(8,51,68,0.35)" }]}>
            <Text style={[styles.marketDataSource, { color: "rgba(34,211,238,0.65)" }]}>
              {report.price_analysis.market_data.source.toUpperCase()}
            </Text>
            <Text style={[styles.marketDataItem, { color: colors.zinc400 }]}>
              {report.price_analysis.market_data.listing_count} live listing{report.price_analysis.market_data.listing_count !== 1 ? "s" : ""}
            </Text>
            {report.price_analysis.market_data.price_min_gbp !== null && report.price_analysis.market_data.price_max_gbp !== null && (
              <Text style={[styles.marketDataItem, { color: colors.zinc300 }]}>
                £{report.price_analysis.market_data.price_min_gbp}–£{report.price_analysis.market_data.price_max_gbp}
              </Text>
            )}
            {report.price_analysis.market_data.price_median_gbp !== null && (
              <Text style={[styles.marketDataItem, { color: colors.zinc400 }]}>
                median{" "}
                <Text style={{ color: colors.brandCyan, fontFamily: "Inter_600SemiBold" }}>
                  £{report.price_analysis.market_data.price_median_gbp}
                </Text>
              </Text>
            )}
          </View>
        )}
        <Text style={[styles.priceNote, { color: colors.zinc400 }]}>{report.price_analysis.price_note}</Text>
      </Card>

      {/* Red flags */}
      {sortedFlags.length > 0 && (
        <Card>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Red Flags</Text>
            <Text style={[styles.cardCount, { color: colors.zinc500 }]}>{sortedFlags.length}</Text>
          </View>
          <View style={{ gap: 12 }}>
            {sortedFlags.map((flag, i) => {
              const flagColor =
                flag.severity === "high" ? colors.red500 : flag.severity === "medium" ? colors.amber400 : colors.brandCyan;
              const flagBg =
                flag.severity === "high"
                  ? "rgba(239,68,68,0.15)"
                  : flag.severity === "medium"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(34,211,238,0.12)";
              return (
                <View key={i} style={styles.flagRow}>
                  <View style={[styles.flagDot, { backgroundColor: flagBg, borderColor: flagColor }]}>
                    <Feather
                      name={flag.severity === "high" ? "alert-triangle" : "alert-circle"}
                      size={12}
                      color={flagColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.flagMeta}>
                      <Text style={[styles.flagSeverity, { color: flagColor }]}>
                        {flag.severity.toUpperCase()}
                      </Text>
                      <Text style={[styles.flagType, { color: colors.zinc600 }]}>
                        {flag.type.replace(/_/g, " ")}
                      </Text>
                    </View>
                    <Text style={[styles.flagMessage, { color: colors.zinc200 }]}>{flag.message}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* Green signals */}
      {report.green_signals.length > 0 && (
        <Card>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Positive Signals</Text>
            <Text style={[styles.cardCount, { color: colors.zinc500 }]}>{report.green_signals.length}</Text>
          </View>
          <View style={{ gap: 10 }}>
            {report.green_signals.map((sig, i) => (
              <View key={i} style={styles.greenRow}>
                <Feather name="check-circle" size={14} color={colors.emerald400} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.flagType, { color: colors.zinc500 }]}>{sig.type.replace(/_/g, " ")}</Text>
                  <Text style={[styles.flagMessage, { color: colors.zinc200 }]}>{sig.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Authenticity check */}
      {report.authenticity_signals.length > 0 && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Authenticity Check</Text>
          <View style={{ gap: 0 }}>
            {report.authenticity_signals.map((sig, i) => {
              const vColor =
                sig.verdict === "pass" ? colors.emerald400 : sig.verdict === "fail" ? colors.red500 : colors.zinc500;
              const vIcon =
                sig.verdict === "pass" ? "check" : sig.verdict === "fail" ? "x" : "minus";
              return (
                <View
                  key={i}
                  style={[
                    styles.authRow,
                    i < report.authenticity_signals.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(63,63,70,0.4)" },
                  ]}
                >
                  <View style={[styles.authVerdict, { borderColor: vColor, backgroundColor: vColor + "22" }]}>
                    <Feather name={vIcon} size={10} color={vColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.authMarker, { color: colors.zinc300 }]}>{sig.marker}</Text>
                    <Text style={[styles.authObserved, { color: colors.zinc500 }]}>{sig.observed}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={[styles.authSummary, { borderTopColor: "rgba(63,63,70,0.4)" }]}>
            <Text style={[styles.authSummaryItem, { color: colors.emerald400 }]}>✓ {authPass} pass</Text>
            <Text style={[styles.authSummaryItem, { color: colors.red500 }]}>✕ {authFail} fail</Text>
            <Text style={[styles.authSummaryItem, { color: colors.zinc500 }]}>? {authUnclear} unclear</Text>
          </View>
        </Card>
      )}

      {/* Missing photos */}
      {report.missing_photos.length > 0 && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Photos to Request</Text>
          <View style={{ gap: 6 }}>
            {report.missing_photos.map((p, i) => (
              <View key={i} style={styles.missingRow}>
                <Feather name="camera-off" size={13} color={colors.zinc600} />
                <Text style={[styles.missingText, { color: colors.zinc400 }]}>{p}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Seller questions */}
      {report.seller_questions.length > 0 && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Questions to Ask the Seller</Text>
          <View style={{ gap: 8 }}>
            {report.seller_questions.map((q, i) => (
              <View key={i} style={[styles.questionRow, { borderColor: "rgba(63,63,70,0.5)" }]}>
                <Text style={[styles.questionNum, { color: colors.brandViolet }]}>{i + 1}.</Text>
                <Text style={[styles.questionText, { color: colors.zinc300 }]}>{q}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Third-party authentication services */}
      {report.lens === "AutographLens" && (level === "medium_high" || level === "high") && (
        <Card>
          <View style={[styles.authServiceHeader, { borderColor: "rgba(248,113,113,0.35)" }]}>
            <Feather name="shield" size={15} color="#f87171" />
            <Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>Get it authenticated</Text>
          </View>
          <Text style={[styles.authServiceIntro, { color: colors.zinc400 }]}>
            The risk level on this autograph is elevated. Consider submitting the item to a recognised third-party authentication service before buying.
          </Text>
          <View style={{ gap: 10 }}>
            {AUTH_SERVICES.map((svc) => (
              <Pressable
                key={svc.name}
                onPress={() => Linking.openURL(svc.url)}
                style={({ pressed }) => [
                  styles.authServiceRow,
                  { borderColor: "rgba(63,63,70,0.6)", backgroundColor: pressed ? "rgba(248,113,113,0.08)" : "rgba(39,39,42,0.5)" },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.authServiceName, { color: colors.foreground }]}>{svc.name}</Text>
                  <Text style={[styles.authServiceDesc, { color: colors.zinc500 }]}>{svc.description}</Text>
                </View>
                <Feather name="external-link" size={13} color="#71717a" />
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <BrandButton
            label={report.saved ? "✓ Report saved" : "Save report"}
            variant="outline"
            disabled={report.saved}
            onPress={() => setReport((r) => (r ? { ...r, saved: true } : r))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <GuardCheckButton
            label="New check"
            onPress={() => router.replace("/guard/check")}
          />
        </View>
      </View>

      <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12}>
        <Text style={[styles.linkText, { color: colors.cyan300 }]}>← Back to dashboard</Text>
      </Pressable>

      <Text style={[styles.disclaimer, { color: colors.zinc500 }]}>
        AI-assisted risk screen, not formal authentication.
      </Text>
      </Animated.View>
    </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  riskDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  riskLevel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
    textAlign: "center",
  },
  riskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  riskMetaLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  riskMetaValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  riskSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  buyRecCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  buyRecHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buyRecLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  buyRecReasoning: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  cardCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginLeft: "auto",
  },
  scoreDimRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dimLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  dimScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  dimVerdict: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
  priceRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  priceCell: {
    gap: 2,
  },
  priceCellLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  priceCellValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  priceCellVerdict: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  priceNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  marketDataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  marketDataSource: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 1.4,
  },
  marketDataItem: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  flagRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  flagDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  flagMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  flagSeverity: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  flagType: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  flagMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  greenRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  authRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  authVerdict: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  authMarker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  authObserved: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  authSummary: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  authSummaryItem: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  missingRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  missingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  questionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  questionNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    marginTop: 1,
    width: 16,
  },
  questionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  authServiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  authServiceIntro: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  authServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authServiceName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  authServiceDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  linkText: {
    textAlign: "center",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
});
