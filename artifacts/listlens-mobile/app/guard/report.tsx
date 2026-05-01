import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import {
  generateId,
  getReport,
  saveReport,
  type GuardReport,
  type RiskLevel,
} from "@/lib/historyStore";

interface RedFlag {
  severity: "low" | "medium" | "high";
  text: string;
}

const DEFAULT_LEVEL: RiskLevel = "medium";
const DEFAULT_SUMMARY =
  "Listing has several photos and a clear price, but is missing a size-label close-up and a sole shot. Seller has limited history and price is below the typical range.";
const DEFAULT_FLAGS: RedFlag[] = [
  {
    severity: "high",
    text: "No size label or style code photo — model identity cannot be confirmed.",
  },
  {
    severity: "medium",
    text: "Asking price is ~38% below the recent median for this model.",
  },
  {
    severity: "low",
    text: "Seller account is < 3 months old with limited prior reviews.",
  },
];
const DEFAULT_QUESTIONS = [
  "Could you share a clear photo of the size label and sole?",
  "Are the original box, laces and accessories included?",
  "Where and when did you buy these originally?",
];

export default function GuardReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{
    lens?: string;
    source?: string;
    url?: string;
    shots?: string;
    reportId?: string;
  }>();

  const [report, setReport] = useState<GuardReport | null>(null);
  const initialised = useRef(false);

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
      }
      const fresh: GuardReport = {
        id: generateId(),
        createdAt: Date.now(),
        lens: params.lens ? String(params.lens) : "ShoeLens",
        source:
          params.source === "screenshots" ? "screenshots" : "url",
        url: params.url ? String(params.url) : "",
        shots: params.shots
          ? String(params.shots).split("|").filter(Boolean)
          : [],
        level: DEFAULT_LEVEL,
        summary: DEFAULT_SUMMARY,
        flags: DEFAULT_FLAGS,
        questions: DEFAULT_QUESTIONS,
        saved: false,
      };
      if (cancelled) return;
      setReport(fresh);
      // Persist immediately so the report appears in History as soon as it's
      // created, mirroring the studio draft auto-save behaviour.
      saveReport(fresh).catch(() => undefined);
      initialised.current = true;
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.reportId]);

  // Persist on changes (e.g. user pressed Save report).
  useEffect(() => {
    if (!initialised.current || !report) return;
    saveReport(report).catch(() => undefined);
  }, [report]);

  if (!report) {
    return (
      <ScreenContainer>
        <View style={{ paddingHorizontal: 4 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Risk report
          </Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            Loading…
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const tone =
    report.level === "high"
      ? colors.red500
      : report.level === "medium"
      ? colors.amber400
      : report.level === "low"
      ? colors.emerald400
      : colors.zinc400;

  const badgeTone =
    report.level === "high"
      ? "red"
      : report.level === "medium"
      ? "amber"
      : report.level === "low"
      ? "emerald"
      : "neutral";

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Risk report
          </Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            {report.lens} ·{" "}
            {report.source === "screenshots" ? "Screenshots" : "Listing URL"}
          </Text>
        </View>
        <Badge label={`${report.level} risk`} tone={badgeTone} />
      </View>

      <Card highlight>
        <View style={styles.scoreRow}>
          <View
            style={[
              styles.scoreDot,
              {
                backgroundColor: tone + "33",
                borderColor: tone,
              },
            ]}
          >
            <Text style={[styles.scoreLevel, { color: tone }]}>
              {report.level.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.scoreLabel, { color: colors.zinc400 }]}>
              Overall risk
            </Text>
            <Text style={[styles.scoreSummary, { color: colors.foreground }]}>
              {report.summary}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Red flags
        </Text>
        <View style={{ gap: 10 }}>
          {report.flags.map((flag, i) => (
            <View key={i} style={styles.flagRow}>
              <View
                style={[
                  styles.flagDot,
                  {
                    backgroundColor:
                      flag.severity === "high"
                        ? "rgba(239,68,68,0.2)"
                        : flag.severity === "medium"
                        ? "rgba(245,158,11,0.2)"
                        : "rgba(34,211,238,0.18)",
                    borderColor:
                      flag.severity === "high"
                        ? colors.red500
                        : flag.severity === "medium"
                        ? colors.amber400
                        : colors.brandCyan,
                  },
                ]}
              >
                <Feather
                  name={flag.severity === "high" ? "alert-triangle" : "alert-circle"}
                  size={12}
                  color={
                    flag.severity === "high"
                      ? colors.red500
                      : flag.severity === "medium"
                      ? colors.amber400
                      : colors.brandCyan
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.flagSeverity, { color: colors.zinc400 }]}>
                  {flag.severity}
                </Text>
                <Text style={[styles.flagText, { color: colors.zinc200 }]}>
                  {flag.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Suggested seller questions
        </Text>
        <View style={{ gap: 8 }}>
          {report.questions.map((q, i) => (
            <View key={i} style={styles.questionRow}>
              <Feather name="message-circle" size={14} color={colors.brandViolet} />
              <Text style={[styles.questionText, { color: colors.zinc300 }]}>
                {q}
              </Text>
            </View>
          ))}
        </View>
      </Card>

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
          <BrandButton
            label="New check"
            variant="guard"
            onPress={() => router.replace("/guard/check")}
          />
        </View>
      </View>

      <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12}>
        <Text style={[styles.linkText, { color: colors.cyan300 }]}>
          ← Back to dashboard
        </Text>
      </Pressable>

      <Text style={[styles.disclaimer, { color: colors.zinc500 }]}>
        AI-assisted risk screen, not formal authentication.
      </Text>
    </ScreenContainer>
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
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scoreDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreLevel: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1.6,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  scoreSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  flagRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  flagDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  flagSeverity: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  flagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  questionRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  questionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
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
