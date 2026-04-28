import type { NextConfig } from "next";

// Clerk publishable key handling.
//
// `next build` always runs with NODE_ENV=production, so a simple `NODE_ENV !== "production"` gate
// cannot distinguish a real production deploy from a CI/preview build. To balance two needs:
//   1. CI / local builds without secrets must still succeed (Clerk SSG would otherwise crash).
//   2. A real production deploy must never silently ship the placeholder key.
//
// We require an explicit opt-in env var (LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1) for the placeholder
// fallback. CI and dev environments set this; real production deploys do not, so a missing real key
// will surface as a build error instead of silently shipping the placeholder.
//
// Belt-and-braces: we additionally refuse to honour the opt-in when `VERCEL_ENV=production` or
// `LISTLENS_ENV=production`, so even an accidentally-leaked CI variable cannot reach a real deploy.
//
// pk_test_Y2xlcmsuZXhhbXBsZS5jb20k = base64("clerk.example.com$") — a valid placeholder format.
const realClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const placeholderOptIn = process.env.LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY === "1";
const isRealProductionDeploy =
  process.env.VERCEL_ENV === "production" || process.env.LISTLENS_ENV === "production";
const allowPlaceholder = placeholderOptIn && !isRealProductionDeploy;
const clerkPlaceholder = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

let clerkKey = realClerkKey ?? "";
if (!realClerkKey && allowPlaceholder) {
  console.warn(
    "[next.config] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is unset; using placeholder (LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1). DO NOT use this build in production."
  );
  clerkKey = clerkPlaceholder;
}
if (!realClerkKey && !allowPlaceholder && isRealProductionDeploy) {
  throw new Error(
    "[next.config] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for production builds (VERCEL_ENV=production or LISTLENS_ENV=production)."
  );
}

// Strict transport, content-type and framing protection. CSP is intentionally
// pragmatic: Clerk, Stripe, OpenAI image hosts and the marketplaces we render
// listings from need to load. Tighten further once telemetry shows no breakage.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js + Clerk inline bootstrap; tighten with nonces in a follow-up.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://challenges.cloudflare.com https://*.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://api.openai.com https://*.posthog.com https://*.sentry.io https://*.axiom.co",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://*.clerk.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKey,
  },
  // Standalone output reduces container image size for self-hosted deploys.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "**.vinted.co.uk" },
      { protocol: "https", hostname: "**.vinted.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
