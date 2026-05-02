import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Archive, Grid2x2, Layers, Shield, Video } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { useColors } from "@/hooks/useColors";

const NAVY = "#040a14";

function TabIcon({
  icon,
  focused,
}: {
  icon: React.ReactNode;
  focused: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.iconContainer}>
      {focused && (
        <View
          pointerEvents="none"
          style={[
            styles.iconGlow,
            Platform.select({
              web: {
                boxShadow: "0 0 14px rgba(34,211,238,0.55)",
              },
              default: {
                shadowColor: colors.brandCyan,
                shadowOpacity: 0.55,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
              },
            }),
          ]}
        />
      )}
      <View
        style={[
          styles.iconBubble,
          focused && {
            backgroundColor: "rgba(34,211,238,0.12)",
            borderColor: "rgba(34,211,238,0.45)",
            borderWidth: 1,
          },
        ]}
      >
        {icon}
      </View>
    </View>
  );
}

/**
 * Tab layout — five primary destinations matching the web nav structure:
 * Home (dashboard), Lenses, Studio, Guard, Vault. Custom Inter-styled header
 * with the brand wordmark replaces a stock title bar. A 1px cyan glow strip
 * above the tab bar matches the web navbar's HUD divider.
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
          fontFamily: "Inter_700Bold",
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : NAVY,
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 72,
          paddingBottom: isWeb ? 8 : 6,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={70}
                tint="dark"
                style={StyleSheet.absoluteFill}
              >
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
                  { backgroundColor: NAVY },
                ]}
              />
            )}
            {/* HUD divider strip on top of the tab bar */}
            <View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 1,
                  backgroundColor: "rgba(34,211,238,0.35)",
                },
                Platform.select({
                  web: {
                    boxShadow: "0 0 6px rgba(34,211,238,0.6)",
                  },
                  default: {
                    shadowColor: colors.brandCyan,
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 0 },
                  },
                }),
              ]}
            />
          </View>
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Grid2x2 size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lenses"
        options={{
          title: "Lenses",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Layers size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: "Studio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Video size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="guard"
        options={{
          title: "Guard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Shield size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={<Archive size={20} color={color} strokeWidth={focused ? 2.5 : 1.8} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: "transparent",
  },
});
