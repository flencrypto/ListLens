import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { GuardOutput } from "@/lib/ai/schemas";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const { id } = await params;
  const check = await prisma.guardCheck.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!check || !check.rawAiOutput) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const report = check.rawAiOutput as unknown as GuardOutput;
  return NextResponse.json({ id, report });
}
