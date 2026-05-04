import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StudioOutput } from "@/lib/ai/schemas";
import { buildVintedDraft } from "@/lib/marketplace/vinted";

/** Escape a value for RFC 4180 CSV. Wraps in double-quotes and escapes inner quotes. */
function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  // Sanitise formula injection: a leading =, +, -, @, tab or CR can trigger sheet formulas
  const sanitised = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  // Wrap in double quotes and escape any inner double quotes as ""
  return `"${sanitised.replace(/"/g, '""')}"`;
}

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

  // Allow client-side edits (title/description/price) to override AI defaults.
  const overrides = await req.json().catch(() => ({}));
  const draft = buildVintedDraft(analysis);
  const title = typeof overrides.title === "string" ? overrides.title : draft.title;
  const description = typeof overrides.description === "string" ? overrides.description : draft.description;
  const price = typeof overrides.price === "number" && Number.isFinite(overrides.price) && overrides.price >= 0
    ? overrides.price
    : draft.price;

  const csv = [
    "title,description,price,brand",
    [
      csvEscape(title),
      csvEscape(description),
      csvEscape(price),
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
