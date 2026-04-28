import Stripe from "stripe";

// Defer Stripe client construction to runtime so next build succeeds without secrets.
// All code must call requireStripe() rather than using the default export directly.
let _stripe: Stripe | null = null;

export function requireStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return _stripe;
}

export const PLANS = {
  studio_starter: {
    name: "Studio Starter",
    priceId: process.env.STRIPE_STUDIO_STARTER_PRICE_ID ?? "",
    price: 1900,
    credits: 50,
  },
  studio_reseller: {
    name: "Studio Reseller",
    priceId: process.env.STRIPE_STUDIO_RESELLER_PRICE_ID ?? "",
    price: 4900,
    credits: 200,
  },
  guard_monthly: {
    name: "Guard Monthly",
    priceId: process.env.STRIPE_GUARD_MONTHLY_PRICE_ID ?? "",
    price: 999,
    credits: 100,
  },
} as const;
