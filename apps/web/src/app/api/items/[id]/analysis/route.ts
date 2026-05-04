import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StudioOutput } from "@/lib/ai/schemas";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { id: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const itemAnalysis = await prisma.itemAnalysis.findFirst({
    where: { itemId: id },
    orderBy: { createdAt: "desc" },
  });
  if (!itemAnalysis) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const analysis = itemAnalysis.rawAiOutput as unknown as StudioOutput;
  return NextResponse.json({ analysis });
}
