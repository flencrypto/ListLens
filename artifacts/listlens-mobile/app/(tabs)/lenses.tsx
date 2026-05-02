import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_ICON_MAP, LENS_REGISTRY, type LensEntry } from "@/constants/lenses";
import { getLensRegistry, type ApiLensEntry } from "@/lib/api";

function apiEntryToLensEntry(e: ApiLensEntry): LensEntry {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    description: e.description,
    icon: e.icon,
    status: e.status as LensEntry["status"],
  };
}

function StatusBadge({ status }: { status: LensEntry["status"] }) {
  if (status === "live") {
    return (
      <View style={[styles.badge, styles.badgeLive]}>
        <Text style={[styles.badgeText, styles.badgeTextLive]}>Live</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeSoon]}>
      <Text style={[styles.badgeText, styles.badgeTextSoon]}>Soon</Text>
    </View>
  );
}

function LensGridCard({ lens }: { lens: LensEntry }) {
  const colors = useColors();
  const isLive = lens.status === "live";
  const Icon = LENS_ICON_MAP[lens.id];

  const scaleAnim = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
  }

  const card = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: isLive
            ? "rgba(10,22,40,0.85)"
            : "rgba(18,18,22,0.7)",
          borderColor: isLive
            ? "rgba(34,211,238,0.22)"
            : "rgba(63,63,70,0.5)",
          borderRadius: 16,
          shadowColor: isLive ? "rgba(34,211,238,0.3)" : "transparent",
          shadowOpacity: isLive ? 0.6 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: isLive ? 4 : 0,
          opacity: isLive ? 1 : 0.6,
        },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* top light rail */}
      <View
        style={[
          styles.lightRail,
          {
            backgroundColor: isLive
              ? "rgba(34,211,238,0.25)"
              : "rgba(63,63,70,0.3)",
          },
        ]}
      />

      {/* icon + badge row */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isLive
                ? "rgba(8,51,68,0.5)"
                : "rgba(39,39,42,0.4)",
              borderColor: isLive
                ? "rgba(34,211,238,0.25)"
                : "rgba(63,63,70,0.4)",
            },
          ]}
        >
          {Icon ? (
            <Icon
              size={16}
              color={isLive ? "#67e8f9" : "#71717a"}
              strokeWidth={1.5}
            />
          ) : (
            <Text style={styles.fallbackIcon}>{lens.icon}</Text>
          )}
        </View>
        <StatusBadge status={lens.status} />
      </View>

      {/* name + active dot */}
      <View style={styles.nameRow}>
        <Text
          style={[
            styles.lensName,
            { color: isLive ? colors.foreground : "#71717a" },
          ]}
          numberOfLines={1}
        >
          {lens.name}
        </Text>
        {isLive && <View style={styles.activeDot} />}
      </View>

      {/* category */}
      <Text
        style={[
          styles.lensCategory,
          { color: isLive ? "#22d3ee88" : "#52525b" },
        ]}
        numberOfLines={1}
      >
        {lens.category}
      </Text>

      {/* description */}
      <Text
        style={[
          styles.lensDesc,
          { color: isLive ? colors.zinc400 : "#52525b" },
        ]}
        numberOfLines={3}
      >
        {lens.description}
      </Text>
    </Animated.View>
  );

  if (!isLive) return card;

  return (
    <Link href={`/lenses/${lens.id}`} asChild>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        {card}
      </Pressable>
    </Link>
  );
}

export default function LensesScreen() {
  const colors = useColors();
  const [registry, setRegistry] = useState<readonly LensEntry[]>(LENS_REGISTRY);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLensRegistry()
      .then(({ registry: apiRegistry }) => {
        if (!cancelled) {
          setRegistry(apiRegistry.map(apiEntryToLensEntry));
          setApiError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRegistry(LENS_REGISTRY);
          setApiError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pairs: LensEntry[][] = [];
  for (let i = 0; i < registry.length; i += 2) {
    pairs.push([registry[i], registry[i + 1]].filter(Boolean) as LensEntry[]);
  }

  return (
    <ScreenContainer withTabPadding>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.brandCyan }]}>
          Catalogue · Lenses
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Lenses</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Specialist category agents that power Studio and Guard. Each lens
          applies its own evidence rules, fields and trust language.
        </Text>
        {apiError && (
          <Text style={[styles.offlineNote, { color: colors.zinc500 }]}>
            Showing cached lens catalogue — connect to refresh.
          </Text>
        )}
        <View style={styles.divider} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.brandCyan} />
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => String(i)}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item: pair }) => (
            <View style={styles.row}>
              {pair.map((lens) => (
                <View key={lens.id} style={styles.cell}>
                  <LensGridCard lens={lens} />
                </View>
              ))}
              {pair.length === 1 && <View style={styles.cell} />}
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 2,
    gap: 4,
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  offlineNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginTop: 10,
    width: 120,
    backgroundColor: "rgba(34,211,238,0.3)",
  },
  loader: {
    paddingVertical: 40,
    alignItems: "center",
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    overflow: "hidden",
  },
  lightRail: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackIcon: {
    fontSize: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lensName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: -0.2,
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
    flexShrink: 0,
  },
  lensCategory: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  lensDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeLive: {
    backgroundColor: "rgba(6,78,59,0.5)",
    borderColor: "rgba(5,150,105,0.5)",
  },
  badgeSoon: {
    backgroundColor: "rgba(39,39,42,0.6)",
    borderColor: "rgba(82,82,91,0.5)",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  badgeTextLive: {
    color: "#6ee7b7",
  },
  badgeTextSoon: {
    color: "#a1a1aa",
  },
});
