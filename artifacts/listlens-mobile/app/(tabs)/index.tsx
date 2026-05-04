import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { BrandLens } from "@/components/brand/BrandLens";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GuardCheckButton } from "@/components/ui/GuardCheckButton";
import { StudioButton } from "@/components/ui/StudioButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { formatRemainingCredits, useSubscription } from "@/lib/revenuecat";
import { getDashboard, type DashboardData, type RecentActivityItem } from "@/lib/api";

interface QuickLink {
  href: "/(tabs)/studio" | "/(tabs)/guard" | "/more/history" | "/more/billing";
  label: string;
  desc: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  gradient: [string, string];
}

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/(tabs)/studio",
    label: "New Listing",
    desc: "Photos → AI draft",
    icon: "camera",
    gradient: ["#06b6d4", "#2563eb"],
  },
  {
    href: "/(tabs)/guard",
    label: "Check Listing",
    desc: "URL → Risk report",
    icon: "shield",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
  {
    href: "/more/history",
    label: "History",
    desc: "Past activity",
    icon: "clock",
    gradient: ["#52525b", "#3f3f46"],
  },
  {
    href: "/more/billing",
    label: "Billing",
    desc: "Plans & credits",
    icon: "credit-card",
    gradient: ["#059669", "#0d9488"],
  },
];

function planLabel(tier: string): string {
  switch (tier) {
    case "studio_starter": return "Studio Starter";
    case "studio_reseller": return "Studio Reseller";
    case "guard_monthly": return "Guard Monthly";
    default: return "Free trial";
  }
}

function ActivityRow({
  item,
  colors,
  onPress,
}: {
  item: RecentActivityItem;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.activityRow,
        { borderBottomColor: colors.zinc800, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.activityMeta, { color: colors.zinc500 }]}>
          {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: colors.cardSurfaceSoft }]}>
        <Text style={[styles.statusBadgeText, { color: colors.zinc400 }]} numberOfLines={1}>
          {item.status}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 480) - 18 * 2 - 12) / 2;
  const { customerInfo, isSubscribed } = useSubscription();
  const planSubtitle = isSubscribed
    ? "Manage your subscription anytime in Billing & Plans."
    : "Upgrade to Studio Starter for unlimited listings from £19.00/month";
  const ctaLabel = isSubscribed ? "Manage" : "Upgrade";

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setDashLoading(true);
      getDashboard()
        .then((d) => setDashData(d))
        .catch(() => setDashData(null))
        .finally(() => setDashLoading(false));
    }, []),
  );

  const tier = dashData?.planTier ?? "free";
  const badgeLabel = isSubscribed ? "Pro" : (dashData ? planLabel(tier) : "Free trial");
  const creditsTitle = dashData
    ? (tier !== "free"
        ? `${planLabel(tier)} plan active`
        : formatRemainingCredits(customerInfo))
    : formatRemainingCredits(customerInfo);

  const studioActivity = dashData?.recentActivity.filter((a) => a.type === "studio") ?? [];
  const guardActivity = dashData?.recentActivity.filter((a) => a.type === "guard") ?? [];

  return (
    <ScreenContainer withTabPadding>
      {/* ── HUD Hero Panel ─────────────────────────────────────────── */}
      <View
        style={[
          styles.heroPanelWrapper,
          {
            borderColor: colors.brandStroke,
            backgroundColor: colors.cardSurfaceSoft,
            borderRadius: colors.radius,
          },
        ]}
      >
        {/* Decorative BrandLens in top-right corner */}
        <View style={styles.heroLensWrap} pointerEvents="none">
          <BrandLens size={110} />
        </View>

        {/* Greeting + badge */}
        <View style={styles.heroContent}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.zinc400 }]}>
                Welcome back
              </Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Dashboard
              </Text>
            </View>
            <Badge label={badgeLabel} tone="cyan" />
          </View>

          {/* Inline stats inside hero */}
          <View style={styles.heroStats}>
            {[
              { value: dashData?.studioCount ?? 0, label: "Listings",     accent: colors.brandCyan },
              { value: dashData?.guardCount   ?? 0, label: "Guard checks", accent: colors.brandViolet },
              { value: dashData?.credits      ?? 0, label: "Credits",      accent: "#a78bfa" },
            ].map(({ value, label, accent }) => (
              <View key={label} style={styles.heroStat}>
                {dashLoading ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : (
                  <Text style={[styles.heroStatNum, { color: accent }]}>{value}</Text>
                )}
                <Text style={[styles.heroStatLabel, { color: colors.zinc400 }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick action grid */}
      <View style={styles.grid}>
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.gridItem,
                {
                  width: cardWidth,
                  borderColor: colors.brandStroke,
                  backgroundColor: colors.cardSurfaceSoft,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <LinearGradient
                colors={link.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridIcon}
              >
                <Feather name={link.icon} size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.gridLabel, { color: colors.foreground }]}>
                {link.label}
              </Text>
              <Text style={[styles.gridDesc, { color: colors.zinc500 }]}>
                {link.desc}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {/* Studio panel */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="camera" size={16} color={colors.brandCyan} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Studio
            </Text>
            {!dashLoading && (dashData?.studioCount ?? 0) > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.brandCyan + "22" }]}>
                <Text style={[styles.countBadgeText, { color: colors.brandCyan }]}>{dashData!.studioCount}</Text>
              </View>
            )}
          </View>
          <Link href="/more/history" asChild>
            <Pressable hitSlop={12}>
              <Text style={[styles.cardLink, { color: colors.zinc400 }]}>
                View all
              </Text>
            </Pressable>
          </Link>
        </View>
        {!dashLoading && studioActivity.length > 0 ? (
          <View style={styles.activityList}>
            {studioActivity.slice(0, 3).map((item) => (
              <ActivityRow key={item.id} item={item} colors={colors} onPress={() => router.push("/more/history" as never)} />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyBox,
              { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.zinc500 }]}>
              No listings yet
            </Text>
            <StudioButton
              label="Enter Studio"
              onPress={() => router.push("/(tabs)/studio")}
            />
          </View>
        )}
      </Card>

      {/* Guard panel */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="shield" size={16} color={colors.brandViolet} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Guard
            </Text>
            {!dashLoading && (dashData?.guardCount ?? 0) > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.brandViolet + "22" }]}>
                <Text style={[styles.countBadgeText, { color: colors.brandViolet }]}>{dashData!.guardCount}</Text>
              </View>
            )}
          </View>
          <Link href="/more/history" asChild>
            <Pressable hitSlop={12}>
              <Text style={[styles.cardLink, { color: colors.zinc400 }]}>
                View all
              </Text>
            </Pressable>
          </Link>
        </View>
        {!dashLoading && guardActivity.length > 0 ? (
          <View style={styles.activityList}>
            {guardActivity.slice(0, 3).map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                colors={colors}
                onPress={() =>
                  router.push({ pathname: "/guard/report", params: { reportId: item.id } } as never)
                }
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyBox,
              { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.zinc500 }]}>
              No checks yet
            </Text>
            <GuardCheckButton
              label="Check a listing"
              onPress={() => router.push("/(tabs)/guard")}
            />
          </View>
        )}
      </Card>

      {/* Credits banner */}
      <Card highlight>
        <View style={styles.creditsRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.creditsTitle, { color: colors.foreground }]}>
              {creditsTitle}
            </Text>
            <Text style={[styles.creditsBody, { color: colors.zinc400 }]}>
              {planSubtitle}
            </Text>
          </View>
          <View style={{ minWidth: 110 }}>
            <StudioButton
              label={ctaLabel}
              onPress={() => router.push("/more/billing")}
            />
          </View>
        </View>
      </Card>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  /* Hero panel */
  heroPanelWrapper: {
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  heroLensWrap: {
    position: "absolute",
    top: -20,
    right: -20,
    opacity: 0.18,
  },
  heroContent: {
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  heroStats: {
    flexDirection: "row",
    gap: 4,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(34,211,238,0.04)",
    gap: 3,
  },
  heroStatNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  heroStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    borderWidth: 1,
    padding: 14,
  },
  gridIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  gridDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  cardLink: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  activityList: {
    gap: 0,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  activityTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  activityMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 90,
  },
  statusBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    textTransform: "capitalize",
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 22,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  creditsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  creditsBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
