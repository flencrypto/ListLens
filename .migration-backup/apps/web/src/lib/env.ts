import { z } from "zod";

/**
 * Centralised, Zod-validated environment for `apps/web`.
 *
 * Rules:
 *  - `next build` always runs with NODE_ENV=production, so we cannot use
 *    NODE_ENV alone to decide "real production". A real production deploy is
 *    one where `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY` is **not** set to "1".
 *  - In real production every required secret MUST be set, otherwise the
 *    process fails fast at boot.
 *  - In CI / dev / preview builds (`LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1`),
 *    secrets are optional so `next build` and tests can run without them.
 */

const isCiOrDev = process.env.LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY === "1";
const isRealProduction = process.env.NODE_ENV === "production" && !isCiOrDev;

const optionalString = z.string().optional();

/**
 * In real production, a required field must be a non-empty string.
 * In CI/dev, it can be missing — code paths that need it should call
 * `requireEnv('FOO')` defensively at runtime.
 */
const requiredInProd = (label: string) =>
  isRealProduction
    ? z.string().min(1, { message: `${label} is required in production` })
    : optionalString;

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Auth — Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requiredInProd("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: requiredInProd("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: optionalString,

  // Database
  DATABASE_URL: requiredInProd("DATABASE_URL"),
  DIRECT_URL: optionalString,

  // Redis (queues + rate limit fallback target)
  REDIS_URL: optionalString,

  // OpenAI
  OPENAI_API_KEY:const mySecret = process.env['OPENAI_API_KEY']

  // Stripe
  STRIPE_SECRET_KEY: requiredInProd("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredInProd("STRIPE_WEBHOOK_SECRET"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  STRIPE_STUDIO_STARTER_PRICE_ID: optionalString,
  STRIPE_STUDIO_RESELLER_PRICE_ID: optionalString,
  STRIPE_GUARD_MONTHLY_PRICE_ID: optionalString,

  // eBay
  EBAY_APP_ID: optionalString,
  EBAY_CERT_ID: optionalString,
  EBAY_DEV_ID: optionalString,
  EBAY_CLIENT_ID: optionalString,
  EBAY_CLIENT_SECRET: optionalString,
  EBAY_ENV: z.enum(["sandbox", "production"]).default("sandbox"),

  // Upstash (rate limiting; falls back to in-memory if unset)
  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  // Observability
  SENTRY_DSN: optionalString,
  POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalString,
  AXIOM_TOKEN: optionalString,
  AXIOM_DATASET: optionalString,

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Build-time toggle (CI/dev only)
  LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY: optionalString,
});

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    // Fail fast in real production, log loudly otherwise.
    const message = `Invalid environment configuration:\n${issues}`;
    if (isRealProduction) {
      throw new Error(message);
    }
    console.warn(`[env] ${message}`);
    // Best-effort: return whatever was provided so dev/test can still run.
    return process.env as unknown as Env;
  }
  return parsed.data;
}

export const env = parseEnv();

/**
 * Throws if the named env var is missing. Use at the entry point of any code
 * path that strictly requires the variable (e.g. inside a route handler that
 * needs Stripe), so we get a clear runtime error instead of an obscure failure.
 */
export function requireEnv(name: keyof Env): string {
  const v = env[name];
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Required environment variable ${String(name)} is not set`);
  }
  return v;
}

export const isProduction = isRealProduction;
