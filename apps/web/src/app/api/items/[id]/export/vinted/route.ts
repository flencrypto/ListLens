import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analysisStore, userOwnsItem } from "@/lib/store";
import { buildVintedDraft } from "@/lib/marketplace/vinted";

/** Escape a value for RFC 4180 CSV. Wraps in double-quotes and escapes inner quotes. */
function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  // Sanitise formula injection: a leading =, +, -, @, tab or CR can trigger sheet formulas
  const sanitised = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  // Wrap in double quotes and escape any inner double quotes as ""
  return `"${sanitised.replace(/"/g, '""')}"`;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const analysis = analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: "No analysis found for this item" }, { status: 404 });
  const draft = buildVintedDraft(analysis);
  const csv = [
    "title,description,price,brand",
    [
      csvEscape(draft.title),
      csvEscape(draft.description),
      csvEscape(draft.price),
      csvEscape(draft.brand ?? ""),
    ].join(","),
  ].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vinted-${id}.csv"`,
    },
  });
}
