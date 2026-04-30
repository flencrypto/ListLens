/**
 * Static plan catalogue used by the billing page in the ported artifact.
 *
 * In the original Next.js app this came from a Stripe-aware module that also
 * exposed server SDKs. The Vite build doesn't ship a Stripe client, so this
 * shim only exposes the plan metadata the UI needs. `priceId` is intentionally
 * undefined so the subscribe buttons render disabled.
 */
export interface PlanInfo {
  name: string;
  price: number;
  priceId?: string;
}

export const PLANS: Record<"studio_starter" | "studio_reseller", PlanInfo> = {
  studio_starter: {
    name: "Studio Starter",
    price: 999,
    priceId: undefined,
  },
  studio_reseller: {
    name: "Studio Reseller",
    price: 2499,
    priceId: undefined,
  },
};
