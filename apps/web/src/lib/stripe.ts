import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

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
