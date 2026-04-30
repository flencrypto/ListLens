import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_REGISTRY, type LensEntry } from "@/constants/lenses";
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

  const live = registry.filter((l) => l.status === "live");
  const planned = registry.filter((l) => l.status === "planned");

  return (
    <ScreenContainer withTabPadding>
      <View style={styles.header}>
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
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.brandCyan} />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Available now
              </Text>
              <Badge label={`${live.length} live`} tone="emerald" />
            </View>
            <View style={styles.list}>
              {live.map((lens) => (
                <LensCard key={lens.id} lens={lens} interactive />
              ))}
            </View>
          </View>

          {planned.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Coming soon
                </Text>
                <Badge label={`${planned.length} planned`} tone="neutral" />
              </View>
              <View style={styles.list}>
                {planned.map((lens) => (
                  <LensCard key={lens.id} lens={lens} dimmed />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

function LensCard({
  lens,
  interactive = false,
  dimmed = false,
}: {
  lens: LensEntry;
  interactive?: boolean;
  dimmed?: boolean;
}) {
  const colors = useColors();
  const inner = (
    <Card glow={interactive} style={{ opacity: dimmed ? 0.6 : 1 }}>
      <View style={styles.lensRow}>
        <Text style={styles.lensIcon}>{lens.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.lensName, { color: colors.foreground }]}>
            {lens.name}
          </Text>
          <Text style={[styles.lensCategory, { color: colors.zinc500 }]}>
            {lens.category}
          </Text>
        </View>
      </View>
      <Text style={[styles.lensDesc, { color: colors.zinc400 }]}>
        {lens.description}
      </Text>
    </Card>
  );

  if (!interactive) return inner;
  return (
    <Link href={`/lenses/${lens.id}`} asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {inner}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    gap: 6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  offlineNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  loader: {
    paddingVertical: 40,
    alignItems: "center",
  },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  list: { gap: 10 },
  lensRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  lensIcon: { fontSize: 26 },
  lensName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  lensCategory: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  lensDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
});
