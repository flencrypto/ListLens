import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { useColors } from "@/hooks/useColors";

const NAVY = "#040a14";

/**
 * Tab layout — five primary destinations matching the web nav structure:
 * Home (dashboard), Lenses, Studio, Guard, More. Custom Inter-styled header
 * with the brand wordmark replaces a stock title bar.
 */
export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brandCyan,
        tabBarInactiveTintColor: colors.zinc500,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : NAVY,
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: "rgba(34,211,238,0.18)",
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill}>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "rgba(4,10,20,0.55)" },
                ]}
              />
            </BlurView>
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: NAVY, borderTopColor: "rgba(34,211,238,0.18)" },
              ]}
            />
          ),
        headerStyle: { backgroundColor: NAVY },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        headerTitle: () => <BrandWordmark layout="inline" size="sm" />,
        headerTitleAlign: "center",
        sceneStyle: { backgroundColor: NAVY },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="lenses"
        options={{
          title: "Lenses",
          tabBarIcon: ({ color, size }) => (
            <Feather name="aperture" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: "Studio",
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="guard"
        options={{
          title: "Guard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="shield" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Feather name="more-horizontal" color={color} size={size - 2} />
          ),
        }}
      />
    </Tabs>
  );
}
