import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.navy }]}>
        <BrandGlyph size={56} />
        <Text
          style={[
            styles.eyebrow,
            { color: colors.cyan300 },
          ]}
        >
          Signal · Lost
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          This screen doesn&apos;t exist.
        </Text>
        <View
          style={[
            styles.divider,
            { backgroundColor: colors.brandStrokeStrong },
          ]}
        />
        <Text style={[styles.body, { color: colors.zinc400 }]}>
          The lens lost focus on this route. Head back to a known surface.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.brandCyan }]}>
            Go to home →
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  divider: {
    width: 80,
    height: 1,
    marginVertical: 4,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 280,
  },
  link: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
