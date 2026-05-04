import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { analyseForStudio } from "@/lib/ai/studio";
import { prisma } from "@/lib/db";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace, userId } = ctx;
  // AI calls are expensive — keep tight quotas per user.
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "items:analyse",
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { id: true, lens: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const photoUrls: string[] = body.photoUrls ?? [];
  // Prefer explicit body.lens; fall back to lens chosen at item creation; default ShoeLens.
  const lens = (typeof body.lens === "string" ? body.lens : null) ?? item.lens ?? "ShoeLens";
  const analysis = await analyseForStudio(photoUrls, body.hint, lens);
  // Persist analysis and update item metadata.
  await prisma.itemAnalysis.create({
    data: {
      itemId: id,
      lens,
      rawAiOutput: analysis as object,
      attributes: (analysis.attributes ?? {}) as object,
      confidence: analysis.identity.confidence,
      warnings: analysis.warnings,
    },
  });
  const ebayOut = analysis.marketplace_outputs?.ebay as Record<string, unknown> | undefined;
  await prisma.item.update({
    where: { id },
    data: {
      lens,
      title: typeof ebayOut?.title === "string" ? ebayOut.title : null,
      description: typeof ebayOut?.description === "string" ? ebayOut.description : null,
      price: typeof analysis.pricing?.recommended === "number" ? analysis.pricing.recommended : null,
      currency: analysis.pricing?.currency ?? "GBP",
    },
  });
  return NextResponse.json({ analysis });
}
