import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getStripeClient, isStripeConfigured } from "../lib/stripe";

const router: IRouter = Router();

function getOrigin(req: Request): string {
  // Prefer a trusted canonical URL (set via APP_BASE_URL secret) to avoid
  // host-header-driven open redirect risks. Fall back to request headers in dev.
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, "");
  }
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

async function getOrCreateStripeCustomer(
  userId: string,
  email?: string | null,
): Promise<string> {
  const stripe = getStripeClient();

  const [user] = await db
    .select({ stripeCustomerId: usersTable.stripeCustomerId })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });

  await db
    .update(usersTable)
    .set({ stripeCustomerId: customer.id })
    .where(eq(usersTable.id, userId));

  return customer.id;
}

router.get("/billing/info", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [user] = await db
      .select({
        credits: usersTable.credits,
        planTier: usersTable.planTier,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id));

    res.json({
      credits: user?.credits ?? 0,
      planTier: user?.planTier ?? "free",
      stripeConfigured: isStripeConfigured(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch billing info");
    res.status(500).json({ error: "Failed to fetch billing info" });
  }
});

const ALLOWED_SUBSCRIPTION_PRICE_IDS = new Set([
  process.env.STRIPE_STUDIO_STARTER_PRICE_ID,
  process.env.STRIPE_STUDIO_RESELLER_PRICE_ID,
  process.env.STRIPE_GUARD_MONTHLY_PRICE_ID,
].filter(Boolean));

const ALLOWED_PAYMENT_PRICE_IDS = new Set([
  process.env.STRIPE_GUARD_SINGLE_PRICE_ID,
].filter(Boolean));

router.post("/billing/checkout", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.redirect(303, "/billing?demo=checkout");
    return;
  }

  if (!req.isAuthenticated()) {
    res.redirect(303, "/api/login?returnTo=/billing");
    return;
  }

  const { priceId, mode } = req.body as { priceId?: string; mode?: string };
  if (!priceId) {
    res.status(400).json({ error: "priceId is required" });
    return;
  }

  const checkoutMode = mode === "payment" ? "payment" : "subscription";

  const allowlist =
    checkoutMode === "payment" ? ALLOWED_PAYMENT_PRICE_IDS : ALLOWED_SUBSCRIPTION_PRICE_IDS;

  // Fail-closed: if Stripe is configured but no price IDs are set yet,
  // reject rather than allowing arbitrary price IDs through.
  if (allowlist.size === 0 || !allowlist.has(priceId)) {
    res.status(400).json({ error: "Unrecognised or unconfigured price ID" });
    return;
  }

  try {
    const stripe = getStripeClient();
    const origin = getOrigin(req);
    const customerId = await getOrCreateStripeCustomer(
      req.user!.id,
      req.user!.email,
    );

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode as "subscription" | "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    res.redirect(303, session.url!);
  } catch (err) {
    logger.error({ err }, "Stripe checkout session creation failed");
    res
      .status(500)
      .json({ error: "Failed to create checkout session. Please try again." });
  }
});

router.post("/billing/portal", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.redirect(303, "/billing?demo=portal");
    return;
  }

  if (!req.isAuthenticated()) {
    res.redirect(303, "/api/login?returnTo=/billing");
    return;
  }

  try {
    const stripe = getStripeClient();
    const origin = getOrigin(req);
    const customerId = await getOrCreateStripeCustomer(
      req.user!.id,
      req.user!.email,
    );

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    res.redirect(303, portalSession.url);
  } catch (err) {
    logger.error({ err }, "Stripe portal session creation failed");
    res
      .status(500)
      .json({ error: "Failed to open billing portal. Please try again." });
  }
});

// In-memory idempotency store: eventId -> expiry timestamp (ms)
// Prevents duplicate credit grants when Stripe retries webhook delivery.
const processedEvents = new Map<string, number>();
const EVENT_IDEMPOTENCY_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours (Stripe max retry window)

function isEventAlreadyProcessed(eventId: string): boolean {
  const expiry = processedEvents.get(eventId);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    processedEvents.delete(eventId);
    return false;
  }
  return true;
}

function markEventProcessed(eventId: string): void {
  // Periodically prune expired entries to avoid unbounded growth
  if (processedEvents.size > 10_000) {
    const now = Date.now();
    for (const [id, expiry] of processedEvents) {
      if (now > expiry) processedEvents.delete(id);
    }
  }
  processedEvents.set(eventId, Date.now() + EVENT_IDEMPOTENCY_TTL_MS);
}

async function applySubscriptionPlanTier(
  customerId: string,
  sub: { items?: { data?: Array<{ price?: { id?: string } }> }; status?: string },
): Promise<void> {
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.stripeCustomerId, customerId));

  if (!user) {
    logger.warn({ customerId }, "No user found for Stripe customer (subscription event)");
    return;
  }

  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  const starterPriceId = process.env.STRIPE_STUDIO_STARTER_PRICE_ID;
  const resellerPriceId = process.env.STRIPE_STUDIO_RESELLER_PRICE_ID;
  const guardMonthlyPriceId = process.env.STRIPE_GUARD_MONTHLY_PRICE_ID;

  let planTier = "free";
  if (priceId && priceId === resellerPriceId) {
    planTier = "studio_reseller";
  } else if (priceId && priceId === starterPriceId) {
    planTier = "studio_starter";
  } else if (priceId && priceId === guardMonthlyPriceId) {
    planTier = "guard_monthly";
  }
  // Unknown price IDs remain free — no implicit privilege escalation

  await db
    .update(usersTable)
    .set({ planTier })
    .where(eq(usersTable.id, user.id));

  logger.info({ userId: user.id, planTier, priceId }, "Subscription plan tier applied");
}

router.post("/webhooks/stripe", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(200).json({ received: true });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    res.status(400).json({ error: "Webhook secret not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret,
    );
  } catch (err) {
    logger.error({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  // Idempotency: skip already-processed events (Stripe delivers at-least-once)
  if (isEventAlreadyProcessed(event.id)) {
    logger.info({ eventId: event.id }, "Duplicate webhook event — skipping");
    res.json({ received: true });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer as string | null;
        if (!customerId) break;

        const [user] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId, customerId));

        if (!user) {
          logger.warn({ customerId }, "No user found for Stripe customer");
          break;
        }

        if (session.mode === "payment") {
          const amountTotal = session.amount_total ?? 0;
          const creditsToAdd = Math.floor(amountTotal / 199);
          if (creditsToAdd > 0) {
            await db
              .update(usersTable)
              .set({ credits: sql`${usersTable.credits} + ${creditsToAdd}` })
              .where(eq(usersTable.id, user.id));
          }
        }

        logger.info(
          { userId: user.id, mode: session.mode },
          "Checkout completed",
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        await applySubscriptionPlanTier(customerId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        const [user] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId, customerId));

        if (!user) break;

        await db
          .update(usersTable)
          .set({ planTier: "free" })
          .where(eq(usersTable.id, user.id));

        logger.info(
          { userId: user.id },
          "Subscription cancelled — reverted to free",
        );
        break;
      }

      default:
        logger.info({ type: event.type }, "Unhandled Stripe webhook event");
    }

    markEventProcessed(event.id);
    res.json({ received: true });
  } catch (err) {
    logger.error({ err, eventType: event.type }, "Stripe webhook processing error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
