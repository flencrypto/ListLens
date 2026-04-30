// Plan catalogue for the billing page. priceId is read from env so a real
// Stripe deployment activates the Subscribe buttons; in demo mode the env
// vars are absent and the buttons render disabled.
const env = (import.meta as unknown as { env?: Record<string, string | undefined> })
  .env ?? {};

export interface PlanInfo {
  name: string;
  price: number;
  credits: number;
  priceId?: string;
}

export const PLANS: Record<
  "studio_starter" | "studio_reseller" | "guard_monthly" | "guard_single",
  PlanInfo
> = {
  studio_starter: {
    name: "Studio Starter",
    price: 1900,
    credits: 50,
    priceId: env["VITE_STRIPE_STUDIO_STARTER_PRICE_ID"] || undefined,
  },
  studio_reseller: {
    name: "Studio Reseller",
    price: 4900,
    credits: 200,
    priceId: env["VITE_STRIPE_STUDIO_RESELLER_PRICE_ID"] || undefined,
  },
  guard_monthly: {
    name: "Guard Monthly",
    price: 999,
    credits: 100,
    priceId: env["VITE_STRIPE_GUARD_MONTHLY_PRICE_ID"] || undefined,
  },
  guard_single: {
    name: "Single Guard Check",
    price: 199,
    credits: 1,
    priceId: env["VITE_STRIPE_GUARD_SINGLE_PRICE_ID"] || undefined,
  },
};
