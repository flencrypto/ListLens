import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Archive } from "lucide-react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

export default function VaultScreen() {
  const colors = useColors();

  return (
    <ScreenContainer withTabPadding>
      <View style={styles.wrap}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: "rgba(34, 211, 238, 0.12)",
              borderColor: "rgba(34, 211, 238, 0.32)",
            },
            Platform.select({
              web: {
                boxShadow: "0 0 26px rgba(34, 211, 238, 0.18)",
              } as object,
              default: {
                shadowColor: colors.brandCyan,
                shadowOpacity: 0.3,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 5,
              },
            }),
          ]}
        >
          <Archive size={30} strokeWidth={2.4} color={colors.cyan300} />
        </View>

        <Text style={[styles.eyebrow, { color: colors.brandCyan }]}>
          Secure Collection
        </Text>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Vault
        </Text>

        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Vault — coming soon. Your saved collections, verified listings and
          protected asset records will live here.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 420,
    paddingHorizontal: 22,
  },
  iconShell: {
    width: 76,
    height: 76,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    letterSpacing: -0.9,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 330,
    textAlign: "center",
  },
});