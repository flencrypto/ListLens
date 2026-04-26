import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Provide placeholder values for build time so SSG does not fail without real secrets
  // pk_test_Y2xlcmsuZXhhbXBsZS5jb20k = base64("clerk.example.com$") — a valid placeholder format
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k",
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
