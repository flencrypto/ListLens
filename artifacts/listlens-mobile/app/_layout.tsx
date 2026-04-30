import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const NAVY = "#040a14";
const FOREGROUND = "#fafafa";

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: NAVY },
        headerTintColor: FOREGROUND,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
        },
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: NAVY },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="studio/new" options={{ title: "New Listing" }} />
      <Stack.Screen name="studio/capture" options={{ title: "Capture Photos" }} />
      <Stack.Screen name="studio/review" options={{ title: "Review Draft" }} />
      <Stack.Screen name="guard/check" options={{ title: "Check Listing" }} />
      <Stack.Screen name="guard/report" options={{ title: "Risk Report" }} />
      <Stack.Screen name="more/history" options={{ title: "History" }} />
      <Stack.Screen name="more/billing" options={{ title: "Billing & Plans" }} />
      <Stack.Screen name="more/legal" options={{ title: "Legal" }} />
      <Stack.Screen name="lenses/[id]" options={{ title: "Lens Detail" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: NAVY }}>
            <KeyboardProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
