import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandBackground } from "@/components/brand/BrandBackground";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Extra bottom padding so floating tab bars don't cover content. */
  withTabPadding?: boolean;
}

/**
 * ScreenContainer — wraps every screen with the brand background and applies
 * sensible padding/safe areas. When `scroll` is true, content scrolls inside
 * a ScrollView with bottom inset for the tab bar.
 */
export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
  withTabPadding = false,
}: Props) {
  const insets = useSafeAreaInsets();
  // Web inset: header tabs aren't rendered the same on web, so reserve room.
  const bottomPad = withTabPadding ? (Platform.OS === "web" ? 100 : 96) : 24;
  const horizontal = padded ? 18 : 0;

  if (scroll) {
    return (
      <View style={styles.flex}>
        <BrandBackground />
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: bottomPad + insets.bottom,
            paddingHorizontal: horizontal,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <BrandBackground />
      <View
        style={{
          flex: 1,
          paddingHorizontal: horizontal,
          paddingTop: 12,
          paddingBottom: bottomPad + insets.bottom,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default ScreenContainer;
