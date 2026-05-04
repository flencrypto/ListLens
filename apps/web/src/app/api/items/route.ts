import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace, userId } = ctx;
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "items:create",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const body = await req.json();
  const lens = (typeof body.lens === "string" ? body.lens : null) ?? "ShoeLens";
  const marketplace = typeof body.marketplace === "string" ? body.marketplace : null;
  const item = await prisma.item.create({
    data: { workspaceId: workspace.id, lens, marketplace, status: "draft" },
  });
  return NextResponse.json({ id: item.id, lens: item.lens, marketplace: item.marketplace, status: item.status });
}

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const items = await prisma.item.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, lens: true, marketplace: true, status: true, title: true, createdAt: true },
  });
  return NextResponse.json({ items });
}
