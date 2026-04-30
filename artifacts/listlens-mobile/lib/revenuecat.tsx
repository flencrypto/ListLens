import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import React, { createContext, useContext, useMemo } from "react";
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

  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: () => Purchases.getCustomerInfo(),
    staleTime: 60 * 1000,
    enabled: revenueCatConfigured,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: () => Purchases.getOfferings(),
    staleTime: 5 * 60 * 1000,
    enabled: revenueCatConfigured,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!revenueCatConfigured) {
        throw new Error("Subscriptions are unavailable on this device.");
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: (info) => {
      queryClient.setQueryData(["revenuecat", "customer-info"], info);
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
      queryClient.setQueryData(["revenuecat", "customer-info"], info);
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
