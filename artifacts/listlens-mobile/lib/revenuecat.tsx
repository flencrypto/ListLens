import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Constants from "expo-constants";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

const REVENUECAT_TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "pro";

const CUSTOMER_INFO_CACHE_KEY = "listlens.revenuecat.customerInfo.v1";
const CUSTOMER_INFO_QUERY_KEY = ["revenuecat", "customer-info"] as const;

const OFFERINGS_CACHE_KEY = "listlens.revenuecat.offerings.v1";
const OFFERINGS_QUERY_KEY = ["revenuecat", "offerings"] as const;

async function loadCachedCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOMER_INFO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as CustomerInfo;
  } catch {
    return null;
  }
}

async function saveCachedCustomerInfo(info: CustomerInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOMER_INFO_CACHE_KEY, JSON.stringify(info));
  } catch {
    // Ignore persistence errors — cache is a best-effort optimization.
  }
}

async function clearCachedCustomerInfo(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CUSTOMER_INFO_CACHE_KEY);
  } catch {
    // Ignore.
  }
}

async function loadCachedOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const raw = await AsyncStorage.getItem(OFFERINGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PurchasesOfferings;
  } catch {
    return null;
  }
}

async function saveCachedOfferings(offerings: PurchasesOfferings): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFERINGS_CACHE_KEY, JSON.stringify(offerings));
  } catch {
    // Ignore persistence errors — cache is a best-effort optimization.
  }
}

function hasActiveEntitlements(info: CustomerInfo | undefined | null): boolean {
  if (!info) return false;
  return Object.keys(info.entitlements?.active ?? {}).length > 0;
}

let hydrationPromise: Promise<void> | null = null;
let hydrationCompleted = false;

/**
 * Loads the last known CustomerInfo from AsyncStorage and seeds it into the
 * React Query cache before the network query fires. Safe to call multiple
 * times — the work runs once and is shared across callers.
 *
 * Call this at app bootstrap (in parallel with font loading) so the first
 * render of the SubscriptionProvider already sees the cached plan.
 */
export function hydrateSubscriptionCache(queryClient: QueryClient): Promise<void> {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    await Promise.all([
      (async () => {
        const cached = await loadCachedCustomerInfo();
        if (cached) {
          const existing = queryClient.getQueryData<CustomerInfo>(CUSTOMER_INFO_QUERY_KEY);
          if (!existing) {
            queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, cached);
          }
        }
      })(),
      (async () => {
        const cached = await loadCachedOfferings();
        if (cached) {
          const existing = queryClient.getQueryData<PurchasesOfferings>(OFFERINGS_QUERY_KEY);
          if (!existing) {
            queryClient.setQueryData(OFFERINGS_QUERY_KEY, cached);
          }
        }
      })(),
    ]);
    hydrationCompleted = true;
  })();
  return hydrationPromise;
}

export function isSubscriptionCacheHydrated(): boolean {
  return hydrationCompleted;
}

function getRevenueCatApiKey(): string {
  const useTestKey =
    __DEV__ ||
    Platform.OS === "web" ||
    Constants.executionEnvironment === "storeClient";

  if (useTestKey) {
    if (!REVENUECAT_TEST_API_KEY) {
      throw new Error("EXPO_PUBLIC_REVENUECAT_TEST_API_KEY not set");
    }
    return REVENUECAT_TEST_API_KEY;
  }
  if (Platform.OS === "ios") {
    if (!REVENUECAT_IOS_API_KEY) {
      throw new Error("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY not set");
    }
    return REVENUECAT_IOS_API_KEY;
  }
  if (Platform.OS === "android") {
    if (!REVENUECAT_ANDROID_API_KEY) {
      throw new Error("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY not set");
    }
    return REVENUECAT_ANDROID_API_KEY;
  }
  if (!REVENUECAT_TEST_API_KEY) {
    throw new Error("RevenueCat API key not configured for this platform");
  }
  return REVENUECAT_TEST_API_KEY;
}

let revenueCatConfigured = false;

export function initializeRevenueCat() {
  if (revenueCatConfigured) return;
  const apiKey = getRevenueCatApiKey();
  Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  revenueCatConfigured = true;
  console.log("Configured RevenueCat");
}

export function isRevenueCatConfigured(): boolean {
  return revenueCatConfigured;
}

interface SubscriptionContextValue {
  customerInfo: CustomerInfo | undefined;
  offerings: PurchasesOfferings | undefined;
  currentOffering: PurchasesOffering | null | undefined;
  isSubscribed: boolean;
  activeProductIds: string[];
  isLoading: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<CustomerInfo>;
  restore: () => Promise<CustomerInfo>;
  isPurchasing: boolean;
  isRestoring: boolean;
  refetchCustomerInfo: () => Promise<unknown>;
}

function useSubscriptionContextValue(): SubscriptionContextValue {
  const queryClient = useQueryClient();
  const [cacheHydrated, setCacheHydrated] = useState<boolean>(() =>
    isSubscriptionCacheHydrated(),
  );

  useEffect(() => {
    if (cacheHydrated) return;
    let cancelled = false;
    void hydrateSubscriptionCache(queryClient).then(() => {
      if (!cancelled) setCacheHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient, cacheHydrated]);

  const customerInfoQuery = useQuery({
    queryKey: CUSTOMER_INFO_QUERY_KEY,
    queryFn: () => Purchases.getCustomerInfo(),
    staleTime: 60 * 1000,
    // Hydration via setQueryData marks the query as fresh, which would
    // suppress the network call for up to staleTime. Force a refetch on
    // mount so the UI renders the cached plan instantly but still
    // reconciles against the live entitlements in the background.
    refetchOnMount: "always",
    enabled: revenueCatConfigured && cacheHydrated,
  });

  useEffect(() => {
    if (!customerInfoQuery.isSuccess || !customerInfoQuery.data) return;
    if (hasActiveEntitlements(customerInfoQuery.data)) {
      void saveCachedCustomerInfo(customerInfoQuery.data);
    } else {
      void clearCachedCustomerInfo();
    }
  }, [customerInfoQuery.isSuccess, customerInfoQuery.data]);

  const offeringsQuery = useQuery({
    queryKey: OFFERINGS_QUERY_KEY,
    queryFn: () => Purchases.getOfferings(),
    staleTime: 5 * 60 * 1000,
    // Hydration via setQueryData marks the query as fresh, which would
    // suppress the network call for up to staleTime. Force a refetch on
    // mount so the UI renders the cached plans instantly but still
    // reconciles against the live catalog in the background.
    refetchOnMount: "always",
    enabled: revenueCatConfigured && cacheHydrated,
  });

  useEffect(() => {
    if (!offeringsQuery.isSuccess || !offeringsQuery.data) return;
    void saveCachedOfferings(offeringsQuery.data);
  }, [offeringsQuery.isSuccess, offeringsQuery.data]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!revenueCatConfigured) {
        throw new Error("Subscriptions are unavailable on this device.");
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: (info) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, info);
      if (hasActiveEntitlements(info)) {
        void saveCachedCustomerInfo(info);
      } else {
        void clearCachedCustomerInfo();
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!revenueCatConfigured) {
        throw new Error("Subscriptions are unavailable on this device.");
      }
      return Purchases.restorePurchases();
    },
    onSuccess: (info) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, info);
      if (hasActiveEntitlements(info)) {
        void saveCachedCustomerInfo(info);
      } else {
        void clearCachedCustomerInfo();
      }
    },
  });

  const isSubscribed =
    customerInfoQuery.data?.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER] !==
    undefined;

  const activeProductIds: string[] = customerInfoQuery.data
    ? Object.values(customerInfoQuery.data.entitlements.active ?? {}).map(
        (e) => e.productIdentifier,
      )
    : [];

  return {
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    currentOffering: offeringsQuery.data?.current ?? null,
    isSubscribed,
    activeProductIds,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    refetchCustomerInfo: customerInfoQuery.refetch,
  };
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContextValue();
  const memo = useMemo(() => value, [value]);
  return <SubscriptionContext.Provider value={memo}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}

export function formatRemainingCredits(info: CustomerInfo | undefined): string {
  if (!info) return "Free trial — 3 listings remaining";
  const active = Object.values(info.entitlements.active ?? {});
  if (active.length === 0) return "Free trial — 3 listings remaining";
  const productIds = active.map((e) => e.productIdentifier);
  if (productIds.some((p) => p.includes("studio_reseller"))) {
    return "Studio Reseller — unlimited listings + bulk tools";
  }
  if (productIds.some((p) => p.includes("studio_starter"))) {
    return "Studio Starter — unlimited listings";
  }
  if (productIds.some((p) => p.includes("guard_monthly"))) {
    return "Guard Monthly — 10 checks per month";
  }
  return "Pro — active subscription";
}
