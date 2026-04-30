/**
 * Runtime detection of whether real Clerk credentials are configured.
 *
 * Two scenarios:
 *   1. Real production deploy: a real publishable + secret key are set; Clerk is fully active.
 *   2. CI / local / preview without secrets: we run in "demo mode" — Clerk middleware,
 *      <ClerkProvider>, and <UserButton /> are skipped, and `auth()` returns a stable
 *      demo user id so the rest of the app (Studio, Guard, etc.) remains functional.
 *
 * The placeholder publishable key (`pk_test_Y2xlcmsuZXhhbXBsZS5jb20k`) is the one
 * `next.config.ts` injects when `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1`. It must be
 * treated as "not configured" at runtime so we do not boot Clerk against it.
 */

// Mirrors the placeholder injected by `next.config.ts` when
// `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1`. Decodes to base64("clerk.example.com$").
const CLERK_PLACEHOLDER_PUBLISHABLE_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

function looksLikeRealClerkPublishableKey(value: string | undefined): boolean {
  if (!value) return false;
  if (value === CLERK_PLACEHOLDER_PUBLISHABLE_KEY) return false;
  // Clerk publishable keys are `pk_test_...` or `pk_live_...`. Anything else is unusable.
  return value.startsWith("pk_test_") || value.startsWith("pk_live_");
}

function looksLikeRealClerkSecretKey(value: string | undefined): boolean {
  if (!value) return false;
  return value.startsWith("sk_test_") || value.startsWith("sk_live_");
}

/**
 * True iff both a real Clerk publishable key and a real Clerk secret key are present
 * (i.e. not missing and not the build-time placeholder). Used to gate Clerk-dependent
 * code paths so the app remains functional in demo mode without Clerk credentials.
 */
export function isClerkConfigured(): boolean {
  return (
    looksLikeRealClerkPublishableKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    looksLikeRealClerkSecretKey(process.env.CLERK_SECRET_KEY)
  );
}

/**
 * Stable demo user id used in demo mode. Constant so that ownership checks in the
 * in-memory store (see `lib/store.ts`) treat all demo-mode requests as the same user.
 */
export const DEMO_USER_ID = "demo-user";
