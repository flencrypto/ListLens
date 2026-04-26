import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analysisStore } from "@/lib/store";
import { buildEbayPayload } from "@/lib/marketplace/ebay";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const analysis = analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: "No analysis found for this item" }, { status: 404 });
  const payload = buildEbayPayload(analysis);
  return NextResponse.json({ success: true, sandboxListingId: `sandbox_${id}`, payload });
}
