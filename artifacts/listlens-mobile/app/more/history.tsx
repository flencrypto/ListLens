import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import {
  listDrafts,
  listReports,
  type GuardReport,
  type StudioDraft,
} from "@/lib/historyStore";

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const [drafts, setDrafts] = useState<StudioDraft[]>([]);
  const [reports, setReports] = useState<GuardReport[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([listDrafts(), listReports()])
        .then(([d, r]) => {
          if (cancelled) return;
          setDrafts(d);
          setReports(r);
          setLoaded(true);
        })
        .catch(() => {
          if (cancelled) return;
          setLoaded(true);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const draftCountLabel =
    drafts.length === 1 ? "1 listing" : `${drafts.length} listings`;
  const reportCountLabel =
    reports.length === 1 ? "1 check" : `${reports.length} checks`;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          History
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Your saved listings and Guard checks.
        </Text>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="camera" size={16} color={colors.brandCyan} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Studio listings
            </Text>
          </View>
          <Badge label={draftCountLabel} tone="neutral" />
        </View>
        {drafts.length === 0 ? (
          <View
            style={[
              styles.empty,
              { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
              {loaded ? "No listings yet" : "Loading…"}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.zinc500 }]}>
              Create a listing in Studio. After analysis, your drafts will appear
              here.
            </Text>
            <BrandButton
              label="Create first listing"
              size="sm"
              variant="outline"
              onPress={() => router.push("/(tabs)/studio")}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {drafts.map((d) => (
              <DraftRow
                key={d.id}
                draft={d}
                onPress={() =>
                  router.push({
                    pathname: "/studio/review",
                    params: { draftId: d.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="shield" size={16} color={colors.brandViolet} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Guard checks
            </Text>
          </View>
          <Badge label={reportCountLabel} tone="neutral" />
        </View>
        {reports.length === 0 ? (
          <View
            style={[
              styles.empty,
              { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
              {loaded ? "No checks yet" : "Loading…"}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.zinc500 }]}>
              Check a listing before you buy. Saved reports will appear here.
            </Text>
            <BrandButton
              label="Check a listing"
              size="sm"
              variant="outline"
              onPress={() => router.push("/(tabs)/guard")}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map((r) => (
              <ReportRow
                key={r.id}
                report={r}
                onPress={() =>
                  router.push({
                    pathname: "/guard/report",
                    params: { reportId: r.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}

function DraftRow({
  draft,
  onPress,
}: {
  draft: StudioDraft;
  onPress: () => void;
}) {
  const colors = useColors();
  const photoCountLabel = `${draft.photos.length} photo${
    draft.photos.length === 1 ? "" : "s"
  }`;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.zinc800,
          backgroundColor: pressed
            ? "rgba(8,51,68,0.45)"
            : "rgba(24,24,27,0.5)",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {draft.title || "Untitled draft"}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.zinc400 }]}>
          {draft.lens} · {photoCountLabel} · {formatDate(draft.updatedAt)}
        </Text>
      </View>
      {draft.exported !== "none" ? (
        <Badge
          label={draft.exported === "vinted" ? "Vinted" : "eBay"}
          tone={draft.exported === "vinted" ? "emerald" : "cyan"}
        />
      ) : null}
      <Feather name="chevron-right" size={18} color={colors.zinc500} />
    </Pressable>
  );
}

function ReportRow({
  report,
  onPress,
}: {
  report: GuardReport;
  onPress: () => void;
}) {
  const colors = useColors();
  const tone =
    report.level === "high"
      ? "red"
      : report.level === "medium"
      ? "amber"
      : report.level === "low"
      ? "emerald"
      : "neutral";
  const subjectLabel =
    report.source === "screenshots"
      ? `${report.shots.length} screenshot${report.shots.length === 1 ? "" : "s"}`
      : (report.url || "Listing URL").replace(/^https?:\/\//, "");
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.zinc800,
          backgroundColor: pressed
            ? "rgba(76,29,149,0.32)"
            : "rgba(24,24,27,0.5)",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {report.lens}
        </Text>
        <Text
          style={[styles.rowMeta, { color: colors.zinc400 }]}
          numberOfLines={1}
        >
          {subjectLabel} · {formatDate(report.createdAt)}
        </Text>
      </View>
      <Badge label={`${report.level} risk`} tone={tone} />
      <Feather name="chevron-right" size={18} color={colors.zinc500} />
    </Pressable>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, gap: 6 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 17,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  rowMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
});
