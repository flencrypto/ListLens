import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace, userId } = ctx;
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "guard:create",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const body = await req.json();
  const url = typeof body.url === "string" ? body.url : null;
  const lens = (typeof body.lens === "string" ? body.lens : null) ?? "ShoeLens";
  const check = await prisma.guardCheck.create({
    data: { workspaceId: workspace.id, url, lens },
  });
  return NextResponse.json({ id: check.id, url: check.url, lens: check.lens, status: "pending" });
}

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const checks = await prisma.guardCheck.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, lens: true, riskLevel: true, confidence: true, createdAt: true },
  });
  return NextResponse.json({ checks });
}
