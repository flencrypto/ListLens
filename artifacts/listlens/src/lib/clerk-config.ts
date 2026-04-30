// Runtime detection of whether real Clerk credentials are configured.
// Mirrors the env-driven behaviour of the original Next.js app, adapted for
// Vite (`import.meta.env` + `VITE_*` prefix). When no real key is present
// we run in demo mode with a stable user id.

const CLERK_PLACEHOLDER_PUBLISHABLE_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

function looksLikeRealClerkPublishableKey(value: string | undefined): boolean {
  if (!value) return false;
  if (value === CLERK_PLACEHOLDER_PUBLISHABLE_KEY) return false;
  return value.startsWith("pk_test_") || value.startsWith("pk_live_");
}

export function isClerkConfigured(): boolean {
  const key = (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env?.["VITE_CLERK_PUBLISHABLE_KEY"];
  return looksLikeRealClerkPublishableKey(key);
}

export const DEMO_USER_ID = "demo-user";
