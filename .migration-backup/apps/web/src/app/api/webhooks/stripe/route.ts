import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireStripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// Stripe webhook handlers must run on Node.js (raw body, no edge streaming).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Map a Stripe price id to the credit allowance defined in PLANS. */
function creditsForPriceId(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  for (const plan of Object.values(PLANS)) {
    if (plan.priceId && plan.priceId === priceId) return plan.credits;
  }
  return 0;
}

/** Map a Stripe price id to a human plan slug. */
function planForPriceId(priceId: string | null | undefined): string {
  if (!priceId) return "free";
  for (const [slug, plan] of Object.entries(PLANS)) {
    if (plan.priceId && plan.priceId === priceId) return slug;
  }
  return "unknown";
}

async function findWorkspaceForCustomer(customerId: string | null) {
  if (!customerId) return null;
  const payment = await prisma.payment.findFirst({
    where: { stripeCustomerId: customerId },
    select: { workspaceId: true },
  });
  return payment?.workspaceId ?? null;
}

async function findWorkspaceForUser(clerkUserId: string | null | undefined) {
  if (!clerkUserId) return null;
  const member = await prisma.workspaceMember.findFirst({
    where: { user: { clerkId: clerkUserId } },
    select: { workspaceId: true },
  });
  return member?.workspaceId ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
  const clerkUserId = (session.metadata?.userId as string | undefined) ?? null;

  // Resolve a workspace: prefer Clerk metadata, fall back to existing customer record.
  const workspaceId =
    (await findWorkspaceForUser(clerkUserId)) ??
    (await findWorkspaceForCustomer(customerId));
  if (!workspaceId) {
    console.warn("[stripe] checkout.session.completed: no workspace resolved", {
      customerId,
      clerkUserId,
    });
    return;
  }

  // Persist a Payment row for this workspace + customer. We use findFirst +
  // update/create to avoid synthesising surrogate ids and to tolerate cases
  // where the customer id is initially missing.
  const existing = await prisma.payment.findFirst({
    where: customerId
      ? { workspaceId, stripeCustomerId: customerId }
      : { workspaceId, stripeCustomerId: null },
    select: { id: true },
  });
  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        stripeCustomerId: customerId ?? undefined,
        subscriptionId: subscriptionId ?? undefined,
        status: "active",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        workspaceId,
        stripeCustomerId: customerId ?? undefined,
        subscriptionId: subscriptionId ?? undefined,
        // The session does not carry an expanded line_items list by default,
        // so we cannot map a price id to a plan slug here. The plan field is
        // populated by the subsequent `invoice.paid` event, which has the
        // line items needed to identify the active plan.
        plan: "free",
        status: "active",
      },
    });
  }

  await prisma.usageEvent.create({
    data: {
      workspaceId,
      eventName: "billing.checkout.completed",
      metadata: { sessionId: session.id, customerId, subscriptionId },
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice, stripeClient: Stripe) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  const workspaceId = await findWorkspaceForCustomer(customerId);
  if (!workspaceId) return;

  // Top up credits based on the line items' price ids.
  let creditsToAdd = 0;
  let plan = "free";
  for (const line of invoice.lines.data) {
    const priceId =
      (typeof line.price === "object" ? line.price?.id : line.price) ?? null;
    creditsToAdd += creditsForPriceId(priceId);
    const planSlug = planForPriceId(priceId);
    if (planSlug !== "free" && planSlug !== "unknown") plan = planSlug;
  }

  if (creditsToAdd > 0) {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { credits: { increment: creditsToAdd }, plan },
    });
  } else if (plan !== "free") {
    await prisma.workspace.update({ where: { id: workspaceId }, data: { plan } });
  }

  await prisma.usageEvent.create({
    data: {
      workspaceId,
      eventName: "billing.invoice.paid",
      metadata: {
        invoiceId: invoice.id,
        customerId,
        creditsAdded: creditsToAdd,
        plan,
      },
    },
  });
  // Avoid an unused-parameter warning while still allowing future expansion
  // (e.g. retrieving the latest charge for receipts).
  void stripeClient;
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  const workspaceId = await findWorkspaceForCustomer(customerId);
  if (!workspaceId) return;
  await prisma.payment.updateMany({
    where: { workspaceId, stripeCustomerId: customerId ?? undefined },
    data: { status: subscription.status, subscriptionId: subscription.id },
  });
  await prisma.usageEvent.create({
    data: {
      workspaceId,
      eventName: "billing.subscription.updated",
      metadata: { subscriptionId: subscription.id, status: subscription.status },
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  const workspaceId = await findWorkspaceForCustomer(customerId);
  if (!workspaceId) return;
  await prisma.workspace.update({ where: { id: workspaceId }, data: { plan: "free" } });
  await prisma.payment.updateMany({
    where: { workspaceId, stripeCustomerId: customerId ?? undefined },
    data: { status: "canceled", plan: "free" },
  });
  await prisma.usageEvent.create({
    data: {
      workspaceId,
      eventName: "billing.subscription.deleted",
      metadata: { subscriptionId: subscription.id },
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripeClient = requireStripe();
  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: refuse duplicate deliveries. Stripe retries on non-2xx, so we
  // record-then-process so a redelivery is a no-op.
  try {
    await prisma.stripeEvent.create({
      data: { stripeEventId: event.id, type: event.type, payload: event as unknown as object },
    });
  } catch (err) {
    // Unique-constraint failure means we've already processed this event id.
    const isDuplicate =
      typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw err;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, stripeClient);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        // Recorded for ops; user-facing notification is a follow-up.
        console.log("[stripe] invoice.payment_failed:", (event.data.object as Stripe.Invoice).id);
        break;
      default:
        // Acknowledged but not actioned — keep the row for audit.
        console.log("[stripe] unhandled event:", event.type);
    }
  } catch (err) {
    // Surface processing failures so Stripe retries; clean up the dedupe row.
    console.error("[stripe] handler error for", event.type, err);
    await prisma.stripeEvent
      .delete({ where: { stripeEventId: event.id } })
      .catch(() => undefined);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
