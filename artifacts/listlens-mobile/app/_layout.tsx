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
import * as SecureStore from "expo-secure-store";

import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  hydrateSubscriptionCache,
  initializeRevenueCat,
  SubscriptionProvider,
} from "@/lib/revenuecat";
import { AuthProvider } from "@/lib/auth";
import { setAuthTokenProvider } from "@/lib/api";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) setBaseUrl(`https://${domain}`);
setAuthTokenGetter(() => SecureStore.getItemAsync("auth_session_token"));
setAuthTokenProvider(() => SecureStore.getItemAsync("auth_session_token"));

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

let revenueCatInitError: string | null = null;
try {
  initializeRevenueCat();
} catch (err) {
  revenueCatInitError = err instanceof Error ? err.message : "Unknown error";
  console.warn("RevenueCat init failed:", revenueCatInitError);
}

const subscriptionCacheHydration = hydrateSubscriptionCache(queryClient).catch(
  (err) => {
    console.warn("Subscription cache hydration failed:", err);
  },
);

const HYDRATION_TIMEOUT_MS = 3000;

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
    feather: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [subscriptionCacheReady, setSubscriptionCacheReady] = React.useState(false);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;
    let timerId: ReturnType<typeof setTimeout>;

    const timeout = new Promise<void>((resolve) => {
      timerId = setTimeout(() => {
        timedOut = true;
        console.warn("Subscription cache hydration timed out after 3 s — proceeding anyway");
        resolve();
      }, HYDRATION_TIMEOUT_MS);
    });

    void Promise.race([subscriptionCacheHydration, timeout]).then(() => {
      if (!timedOut) clearTimeout(timerId);
      if (!cancelled) setSubscriptionCacheReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, []);

  const ready = (fontsLoaded || fontError) && subscriptionCacheReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  const inner = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: NAVY }}>
            <KeyboardProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {inner}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
