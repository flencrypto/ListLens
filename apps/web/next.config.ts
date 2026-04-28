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
// pk_test_Y2xlcmsuZXhhbXBsZS5jb20k = base64("clerk.example.com$") — a valid placeholder format.
const realClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const allowPlaceholder = process.env.LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY === "1";
const clerkPlaceholder = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

let clerkKey = realClerkKey ?? "";
if (!realClerkKey && allowPlaceholder) {
  console.warn(
    "[next.config] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is unset; using placeholder (LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1). DO NOT use this build in production."
  );
  clerkKey = clerkPlaceholder;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKey,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "**.vinted.co.uk" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
