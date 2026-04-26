import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analysisStore } from "@/lib/store";
import { buildVintedDraft } from "@/lib/marketplace/vinted";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const analysis = analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: "No analysis found for this item" }, { status: 404 });
  const draft = buildVintedDraft(analysis);
  const csv = `title,description,price,brand\n"${draft.title}","${draft.description}",${draft.price},"${draft.brand ?? ""}"`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vinted-${id}.csv"`,
    },
  });
}
