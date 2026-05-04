import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StudioOutput } from "@/lib/ai/schemas";
import { buildEbayPayload } from "@/lib/marketplace/ebay";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  if (!itemAnalysis) return NextResponse.json({ error: "No analysis found for this item" }, { status: 404 });
  const analysis = itemAnalysis.rawAiOutput as unknown as StudioOutput;

  // Allow client-side edits (title/description/price) to override AI defaults
  const overrides = await req.json().catch(() => ({}));
  const merged = {
    ...analysis,
    pricing: typeof overrides.price === "number" && Number.isFinite(overrides.price) && overrides.price >= 0
      ? { ...analysis.pricing, recommended: overrides.price }
      : analysis.pricing,
    marketplace_outputs: {
      ...analysis.marketplace_outputs,
      ebay: {
        ...analysis.marketplace_outputs.ebay,
        ...(typeof overrides.title === "string" ? { title: overrides.title } : {}),
        ...(typeof overrides.description === "string" ? { description: overrides.description } : {}),
      },
    },
  };
  const payload = buildEbayPayload(merged);
  const sandboxListingId = `sandbox_${id}`;
  await prisma.listing.create({
    data: {
      itemId: id,
      marketplace: "ebay_sandbox",
      marketplaceListingId: sandboxListingId,
      status: "published",
      payload: payload as object,
      publishedAt: new Date(),
    },
  });
  return NextResponse.json({ success: true, sandboxListingId, payload });
}
