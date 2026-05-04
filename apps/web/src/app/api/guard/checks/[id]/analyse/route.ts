import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { analyseForGuard } from "@/lib/ai/guard";
import { prisma } from "@/lib/db";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace, userId } = ctx;
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "guard:analyse",
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const { id } = await params;
  const check = await prisma.guardCheck.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { id: true, url: true, lens: true },
  });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Use stored metadata or override from body.
  const body = await req.json().catch(() => ({}));
  const url = (typeof body.url === "string" ? body.url : null) ?? check.url;
  const screenshotUrls: string[] | undefined = Array.isArray(body.screenshotUrls) ? body.screenshotUrls : undefined;
  const lens = (typeof body.lens === "string" ? body.lens : null) ?? check.lens ?? "ShoeLens";

  const report = await analyseForGuard(url ?? undefined, screenshotUrls, lens);

  // Persist the report and derived entities.
  await prisma.guardCheck.update({
    where: { id },
    data: {
      lens,
      riskLevel: report.risk.level,
      confidence: report.risk.confidence,
      rawAiOutput: report as object,
    },
  });
  await prisma.guardFinding.deleteMany({ where: { guardCheckId: id } });
  await prisma.guardQuestion.deleteMany({ where: { guardCheckId: id } });
  if (report.red_flags.length > 0) {
    await prisma.guardFinding.createMany({
      data: report.red_flags.map((f) => ({
        guardCheckId: id,
        severity: f.severity,
        type: f.type,
        message: f.message,
      })),
    });
  }
  if (report.seller_questions.length > 0) {
    await prisma.guardQuestion.createMany({
      data: report.seller_questions.map((q) => ({
        guardCheckId: id,
        questionText: q,
      })),
    });
  }
  return NextResponse.json({ report });
}
