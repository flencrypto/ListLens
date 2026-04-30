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
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardSurfaceSoft, borderColor: colors.brandStroke, borderRadius: colors.radius }]}>
          {dashLoading ? (
            <ActivityIndicator size="small" color={colors.brandCyan} />
          ) : (
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{dashData?.studioCount ?? 0}</Text>
          )}
          <Text style={[styles.statLabel, { color: colors.zinc400 }]}>Listings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardSurfaceSoft, borderColor: colors.brandStroke, borderRadius: colors.radius }]}>
          {dashLoading ? (
            <ActivityIndicator size="small" color={colors.brandViolet} />
          ) : (
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{dashData?.guardCount ?? 0}</Text>
          )}
          <Text style={[styles.statLabel, { color: colors.zinc400 }]}>Guard checks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardSurfaceSoft, borderColor: colors.brandStroke, borderRadius: colors.radius }]}>
          {dashLoading ? (
            <ActivityIndicator size="small" color="#a78bfa" />
          ) : (
            <Text style={[styles.statNumber, { color: "#a78bfa" }]}>{dashData?.credits ?? 0}</Text>
          )}
          <Text style={[styles.statLabel, { color: colors.zinc400 }]}>Credits</Text>
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
              <ActivityRow key={item.id} item={item} colors={colors} onPress={() => router.push("/more/history")} />
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
            <BrandButton
              label="Create first listing"
              size="sm"
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
              <ActivityRow key={item.id} item={item} colors={colors} onPress={() => router.push("/more/history")} />
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
            <BrandButton
              label="Check a listing"
              variant="guard"
              size="sm"
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
            <BrandButton
              label={ctaLabel}
              size="sm"
              onPress={() => router.push("/more/billing")}
            />
          </View>
        </View>
      </Card>

      {/* Brand reinforcement panel */}
      <View style={styles.brandPanel}>
        <BrandLens size={120} />
        <Text style={[styles.brandPanelTitle, { color: colors.foreground }]}>
          List smarter. Buy safer.
        </Text>
        <Text style={[styles.brandPanelBody, { color: colors.zinc400 }]}>
          AI-powered listings for eBay & Vinted, and a buyer risk screen for
          anything you check before you buy.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
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
  brandPanel: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  brandPanelTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 4,
  },
  brandPanelBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 320,
  },
});
