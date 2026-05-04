import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const body = await req.json();
  const urls = Array.isArray(body?.urls) ? (body.urls as unknown[]).filter((u): u is string => typeof u === "string") : [];
  const existing = await prisma.itemPhoto.count({ where: { itemId: id } });
  const photos = await prisma.$transaction(
    urls.map((url, i) =>
      prisma.itemPhoto.create({
        data: {
          itemId: id,
          url,
          sortOrder: existing + i,
          isPrimary: existing === 0 && i === 0,
        },
      })
    )
  );
  return NextResponse.json({ photos: photos.map((p) => ({ id: p.id, url: p.url, itemId: p.itemId })) });
}
