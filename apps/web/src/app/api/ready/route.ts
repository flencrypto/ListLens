import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReadinessChecks {
  db: { ok: boolean; error?: string };
  redis?: { ok: boolean; error?: string };
}

async function checkDb(): Promise<ReadinessChecks["db"]> {
  if (!process.env.DATABASE_URL) return { ok: false, error: "DATABASE_URL not set" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

async function checkRedis(): Promise<ReadinessChecks["redis"] | undefined> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return undefined;
  try {
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(1000),
    });
    return { ok: res.ok };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function GET() {
  const [db, redis] = await Promise.all([checkDb(), checkRedis()]);
  const checks: ReadinessChecks = { db, ...(redis ? { redis } : {}) };
  const ready = db.ok && (!redis || redis.ok);
  return NextResponse.json(
    { ready, checks, timestamp: new Date().toISOString() },
    { status: ready ? 200 : 503 },
  );
}
