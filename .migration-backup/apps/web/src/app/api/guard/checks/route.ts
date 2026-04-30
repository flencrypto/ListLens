import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { guardCheckMeta, guardOwner } from "@/lib/store";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "guard:create",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const body = await req.json();
  const id = `guard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  guardCheckMeta.set(id, {
    url: body.url,
    screenshotUrls: body.screenshotUrls,
    lens: body.lens ?? "ShoeLens",
  });
  guardOwner.set(id, userId);
  return NextResponse.json({ id, url: body.url, lens: body.lens ?? "ShoeLens", status: "pending" });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ checks: [] });
}
