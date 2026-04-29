import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { analysisStore, userOwnsItem } from "@/lib/store";
import { buildEbayPayload } from "@/lib/marketplace/ebay";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const analysis = analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: "No analysis found for this item" }, { status: 404 });

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
  return NextResponse.json({ success: true, sandboxListingId: `sandbox_${id}`, payload });
}
