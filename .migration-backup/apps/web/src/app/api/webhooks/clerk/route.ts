import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Clerk emits webhooks via Svix. The signature header is a space-separated
 * list of `v1,<base64-hmac-sha256>` entries. The signed payload is
 * `${svix_id}.${svix_timestamp}.${body}` and the secret is base64-decoded
 * from the `whsec_` prefix.
 *
 * This implements the Svix verification scheme without pulling in the `svix`
 * dependency just for one route. See https://docs.svix.com/receiving/verifying-payloads/how-manual
 */
function verifySvix(
  body: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  rawSecret: string,
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  // Reject events older than 5 minutes to defeat replay attacks.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 5 * 60) return false;

  const secretB64 = rawSecret.startsWith("whsec_") ? rawSecret.slice("whsec_".length) : rawSecret;
  const secret = Buffer.from(secretB64, "base64");
  const signedPayload = `${id}.${timestamp}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("base64");

  return signature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((sig): sig is string => Boolean(sig))
    .some((sig) => {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
}

interface ClerkUserEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string; id: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    public_metadata?: { role?: string };
  };
}

function primaryEmail(data: ClerkUserEvent["data"]): string | null {
  const emails = data.email_addresses ?? [];
  if (emails.length === 0) return null;
  if (data.primary_email_address_id) {
    const primary = emails.find((e) => e.id === data.primary_email_address_id);
    if (primary) return primary.email_address;
  }
  return emails[0].email_address;
}

async function provisionUser(data: ClerkUserEvent["data"]) {
  const email = primaryEmail(data);
  if (!email) {
    console.warn("[clerk] user.created without an email; skipping provision", data.id);
    return;
  }
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
  const role = data.public_metadata?.role === "admin" ? "admin" : "user";

  // Idempotent: existing user is left alone except for profile fields.
  const user = await prisma.user.upsert({
    where: { clerkId: data.id },
    create: {
      clerkId: data.id,
      email,
      name: name ?? undefined,
      avatarUrl: data.image_url ?? undefined,
      role,
    },
    update: {
      email,
      name: name ?? undefined,
      avatarUrl: data.image_url ?? undefined,
      role,
    },
  });

  // Provision a default workspace if the user has none.
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existing) return;

  await prisma.workspace.create({
    data: {
      name: name ? `${name}'s workspace` : "Personal workspace",
      members: { create: { userId: user.id, role: "owner" } },
    },
  });
}

async function deprovisionUser(clerkId: string) {
  // Soft handling: keep historical data but detach Clerk identity by
  // anonymising the user row. Cascading deletes would lose audit trail.
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      clerkId: `deleted_${user.id}`,
      email: `deleted+${user.id}@listlens.invalid`,
      name: null,
      avatarUrl: null,
    },
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const ok = verifySvix(
    body,
    {
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      signature: req.headers.get("svix-signature"),
    },
    secret,
  );
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: ClerkUserEvent;
  try {
    event = JSON.parse(body) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await provisionUser(event.data);
        break;
      case "user.deleted":
        await deprovisionUser(event.data.id);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[clerk] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
