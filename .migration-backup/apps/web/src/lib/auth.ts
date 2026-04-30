import { auth } from "@/lib/auth-shim";
import { NextResponse } from "next/server";
import { prisma } from "./db";

/**
 * Auth + tenancy helpers for API route handlers.
 *
 * Routes should call:
 *   const ctx = await requireUser();
 *   if (ctx instanceof NextResponse) return ctx;
 *   // ctx.userId is the Clerk id
 *
 * Or, when a workspace context is needed:
 *   const ctx = await requireWorkspace();
 *   if (ctx instanceof NextResponse) return ctx;
 *   // ctx.user, ctx.workspace are Prisma rows
 */

export type AuthCtx = { userId: string };
export type WorkspaceCtx = {
  userId: string;
  user: { id: string; clerkId: string; role: string };
  workspace: { id: string; name: string };
};

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const FORBIDDEN = NextResponse.json({ error: "Forbidden" }, { status: 403 });

export async function requireUser(): Promise<AuthCtx | NextResponse> {
  const { userId } = await auth();
  if (!userId) return UNAUTHORIZED;
  return { userId };
}

/**
 * Resolves the current Clerk user to a Prisma `User` and their primary
 * workspace. Returns 401 if unauthenticated, 403 if no workspace is
 * provisioned (the Clerk webhook should provision one on sign-up; this
 * branch indicates a missed webhook and is logged for ops).
 */
export async function requireWorkspace(): Promise<WorkspaceCtx | NextResponse> {
  const { userId } = await auth();
  if (!userId) return UNAUTHORIZED;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      role: true,
      workspaces: {
        select: { workspace: { select: { id: true, name: true } } },
        take: 1,
      },
    },
  });

  if (!user || user.workspaces.length === 0) {
    console.warn(
      `[auth] Clerk user ${userId} has no provisioned workspace. Did the Clerk webhook fire?`,
    );
    return NextResponse.json(
      { error: "Workspace not provisioned. Please sign in again." },
      { status: 403 },
    );
  }

  return {
    userId,
    user: { id: user.id, clerkId: user.clerkId, role: user.role },
    workspace: user.workspaces[0].workspace,
  };
}

/** Restricts the route to admin users (Clerk role mirrored on User.role). */
export async function requireAdmin(): Promise<WorkspaceCtx | NextResponse> {
  const ctx = await requireWorkspace();
  if (ctx instanceof NextResponse) return ctx;
  if (ctx.user.role !== "admin") return FORBIDDEN;
  return ctx;
}
