import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();

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
          <Badge label="0 listings" tone="neutral" />
        </View>
        <View
          style={[
            styles.empty,
            { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
            No listings yet
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
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="shield" size={16} color={colors.brandViolet} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Guard checks
            </Text>
          </View>
          <Badge label="0 checks" tone="neutral" />
        </View>
        <View
          style={[
            styles.empty,
            { borderColor: colors.zinc800, borderRadius: colors.radius - 4 },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.zinc300 }]}>
            No checks yet
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
      </Card>
    </ScreenContainer>
  );
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
});
