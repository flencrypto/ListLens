import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const { id } = await params;
  const check = await prisma.guardCheck.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { id: true },
  });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const questions = await prisma.guardQuestion.findMany({
    where: { guardCheckId: id },
    select: { questionText: true },
  });
  return NextResponse.json({ questions: questions.map((q) => q.questionText) });
}
