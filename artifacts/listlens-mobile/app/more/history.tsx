import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import {
  listGuardChecks,
  listItems,
  type ApiGuardCheck,
  type ApiListing,
} from "@/lib/api";
import {
  listDrafts,
  listReports,
  type GuardReport,
  type StudioDraft,
} from "@/lib/historyStore";

type RiskLevel = "low" | "medium" | "medium_high" | "high" | "inconclusive";

interface DisplayDraft {
  id: string;
  title: string;
  lens: string;
  photos: string[];
  updatedAt: number;
  exported: "none" | "ebay" | "vinted";
}

interface DisplayReport {
  id: string;
  lens: string;
  source: "url" | "screenshots";
  url: string;
  shots: string[];
  riskLevel: RiskLevel;
  createdAt: number;
}

function apiListingToDisplay(l: ApiListing): DisplayDraft {
  return {
    id: l.id,
    title: l.title ?? "",
    lens: l.lens,
    photos: Array.isArray(l.photoUrls) ? l.photoUrls : [],
    updatedAt: new Date(l.updatedAt ?? l.createdAt).getTime(),
    exported: "none",
  };
}

function apiGuardCheckToDisplay(c: ApiGuardCheck): DisplayReport {
  return {
    id: c.id,
    lens: c.lens,
    source: c.url ? "url" : "screenshots",
    url: c.url ?? "",
    shots: [],
    riskLevel: (c.riskLevel as RiskLevel) ?? "inconclusive",
    createdAt: new Date(c.createdAt).getTime(),
  };
}

function studioToDisplay(d: StudioDraft): DisplayDraft {
  return {
    id: d.id,
    title: d.title ?? "",
    lens: d.lens,
    photos: d.photos ?? [],
    updatedAt: d.updatedAt,
    exported: d.exported,
  };
}

function reportToDisplay(r: GuardReport): DisplayReport {
  return {
    id: r.id,
    lens: r.lens,
    source: r.source,
    url: r.url ?? "",
    shots: r.shots ?? [],
    riskLevel: r.risk?.level ?? "inconclusive",
    createdAt: r.createdAt,
  };
}

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [drafts, setDrafts] = useState<DisplayDraft[]>([]);
  const [reports, setReports] = useState<DisplayReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "local">("local");

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoaded(false);
      setError(null);

      async function load() {
        try {
          if (isAuthenticated) {
            try {
              const [apiListings, apiChecks] = await Promise.all([
                listItems(),
                listGuardChecks(),
              ]);
              if (!cancelled) {
                setDrafts(apiListings.map(apiListingToDisplay));
                setReports(apiChecks.map(apiGuardCheckToDisplay));
                setSource("api");
              }
            } catch {
              // API unavailable — show locally-saved data so history is never blank
              const [localDrafts, localReports] = await Promise.all([
                listDrafts(),
                listReports(),
              ]);
              if (!cancelled) {
                setDrafts(localDrafts.map(studioToDisplay));
                setReports(localReports.map(reportToDisplay));
                setSource("local");
              }
            }
          } else {
            const [localDrafts, localReports] = await Promise.all([
              listDrafts(),
              listReports(),
            ]);
            if (!cancelled) {
              setDrafts(localDrafts.map(studioToDisplay));
              setReports(localReports.map(reportToDisplay));
              setSource("local");
            }
          }
        } catch {
          if (!cancelled) {
            setError("Could not load history. Check your connection and try again.");
          }
        } finally {
          if (!cancelled) setLoaded(true);
        }
      }

      if (!authLoading) {
        load();
      }

      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, authLoading]),
  );

  const draftCountLabel =
    drafts.length === 1 ? "1 listing" : `${drafts.length} listings`;
  const reportCountLabel =
    reports.length === 1 ? "1 check" : `${reports.length} checks`;

  const loadingText = authLoading || !loaded ? "Loading…" : undefined;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          History
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          {isAuthenticated
            ? "Your saved listings and Guard checks."
            : "Sign in to sync history across devices."}
        </Text>
      </View>

      {error ? (
        <Card>
          <Text style={[styles.emptyTitle, { color: colors.zinc300, textAlign: "center", paddingVertical: 16 }]}>
            {error}
          </Text>
        </Card>
      ) : (
        <>
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Feather name="camera" size={16} color={colors.brandCyan} />
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Studio listings
                </Text>
              </View>
              {loaded && <Badge label={draftCountLabel} tone="neutral" />}
            </View>
            {drafts.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
                ]}
              >
                <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
                  {loadingText ?? "No listings yet"}
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
                {source === "api" && (
                  <Text style={[styles.sourceNote, { color: colors.zinc500 }]}>
                    Synced from your account
                  </Text>
                )}
                {drafts.map((d) => (
                  <DraftRow
                    key={d.id}
                    draft={d}
                    onPress={() =>
                      router.push({
                        pathname: "/studio/review",
                        params: {
                          draftId: d.id,
                          ...(source === "api" ? { itemId: d.id } : {}),
                        },
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
              {loaded && <Badge label={reportCountLabel} tone="neutral" />}
            </View>
            {reports.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
                ]}
              >
                <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
                  {loadingText ?? "No checks yet"}
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
        </>
      )}
    </ScreenContainer>
  );
}

function DraftRow({
  draft,
  onPress,
}: {
  draft: DisplayDraft;
  onPress: () => void;
}) {
  const colors = useColors();
  const [thumbError, setThumbError] = useState(false);
  const photoCountLabel = `${draft.photos.length} photo${
    draft.photos.length === 1 ? "" : "s"
  }`;
  const firstPhoto = draft.photos[0];
  const showImage = Boolean(firstPhoto) && !thumbError;
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
      <View
        style={[
          styles.thumb,
          {
            borderColor: colors.brandStroke,
            backgroundColor: "rgba(8,16,28,0.85)",
          },
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: firstPhoto }}
            style={styles.thumbImage}
            contentFit="cover"
            transition={120}
            accessibilityLabel={`Photo for ${draft.title || "untitled draft"}`}
            onError={() => setThumbError(true)}
          />
        ) : (
          <Feather name="camera-off" size={18} color={colors.zinc500} />
        )}
        {showImage && draft.photos.length > 1 ? (
          <View style={styles.thumbCountPill}>
            <Text style={styles.thumbCountText}>+{draft.photos.length - 1}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[styles.rowTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {draft.title || "Untitled draft"}
        </Text>
        <Text
          style={[styles.rowMeta, { color: colors.zinc400 }]}
          numberOfLines={1}
        >
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
  report: DisplayReport;
  onPress: () => void;
}) {
  const colors = useColors();
  const level = report.riskLevel ?? "inconclusive";
  const tone =
    level === "high"
      ? "red"
      : level === "medium" || level === "medium_high"
      ? "amber"
      : level === "low"
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
      <Badge label={`${level} risk`} tone={tone} />
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
  sourceNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginBottom: 4,
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
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbCountPill: {
    position: "absolute",
    right: 2,
    bottom: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: "rgba(4,10,20,0.85)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
  },
  thumbCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: "#a5f3fc",
    letterSpacing: 0.3,
  },
});
