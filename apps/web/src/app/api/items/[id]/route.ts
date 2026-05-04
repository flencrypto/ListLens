import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  const { workspace } = ctx;
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: item.id,
    status: item.status,
    lens: item.lens,
    marketplace: item.marketplace,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: item.currency,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const updated = await prisma.item.update({
    where: { id },
    data: {
      ...(typeof body.title === "string" ? { title: body.title } : {}),
      ...(typeof body.description === "string" ? { description: body.description } : {}),
      ...(typeof body.condition === "string" ? { condition: body.condition } : {}),
      ...(typeof body.price === "number" ? { price: body.price } : {}),
      ...(typeof body.status === "string" ? { status: body.status } : {}),
    },
  });
  return NextResponse.json({ id: updated.id, ...body });
}
