import { NextResponse } from "next/server";

/**
 * Lightweight, dependency-free rate limiter with a process-local sliding window.
 *
 * In production this is a best-effort fallback. When `UPSTASH_REDIS_REST_URL`
 * and `UPSTASH_REDIS_REST_TOKEN` are configured, the limiter delegates to
 * Upstash's REST API for cluster-wide enforcement. The in-memory map is
 * acceptable for low-traffic single-instance deploys but should be replaced
 * with the Upstash path before scaling out.
 */

type Bucket = { count: number; resetAt: number };
const localBuckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Unique identifier for this limiter (e.g. "api:items:create"). */
  key: string;
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

async function upstashIncrement(
  fullKey: string,
  windowSeconds: number,
): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    // Pipeline: INCR + EXPIRE NX. Returns array of results.
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", fullKey],
        ["EXPIRE", fullKey, windowSeconds.toString(), "NX"],
      ]),
      // Don't let a slow Upstash call block the request indefinitely.
      signal: AbortSignal.timeout(500),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: number }>;
    return typeof json[0]?.result === "number" ? json[0].result : null;
  } catch {
    return null;
  }
}

function localIncrement(fullKey: string, windowMs: number): { count: number; resetAt: number } {
  const now = Date.now();
  const existing = localBuckets.get(fullKey);
  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    localBuckets.set(fullKey, bucket);
    return bucket;
  }
  existing.count += 1;
  return existing;
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const fullKey = `rl:${options.key}:${identifier}`;
  const windowSeconds = Math.max(1, Math.floor(options.windowMs / 1000));

  const upstashCount = await upstashIncrement(fullKey, windowSeconds);
  if (upstashCount !== null) {
    const resetAt = Date.now() + options.windowMs;
    return {
      success: upstashCount <= options.limit,
      remaining: Math.max(0, options.limit - upstashCount),
      resetAt,
    };
  }

  const bucket = localIncrement(fullKey, options.windowMs);
  return {
    success: bucket.count <= options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/**
 * Convenience wrapper for API route handlers. Returns a `NextResponse` 429
 * when the limit has been exceeded, otherwise `null` so the caller can
 * proceed.
 */
export async function enforceRateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const result = await rateLimit(identifier, options);
  if (result.success) return null;
  const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSec.toString(),
        "X-RateLimit-Limit": options.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
      },
    },
  );
}

/** Best-effort identifier: prefer userId, fall back to client IP, then "anonymous". */
export function rateLimitIdentifier(
  userId: string | null | undefined,
  req: Request,
): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
  return `ip:${ip}`;
}
