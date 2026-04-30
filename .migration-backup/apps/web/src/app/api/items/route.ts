import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { itemOwner, itemMeta } from "@/lib/store";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "items:create",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const body = await req.json();
  const id = `item_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const lens = body.lens ?? "ShoeLens";
  itemOwner.set(id, userId);
  itemMeta.set(id, { lens, marketplace: body.marketplace });
  return NextResponse.json({ id, lens, marketplace: body.marketplace, status: "draft" });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: [] });
}
