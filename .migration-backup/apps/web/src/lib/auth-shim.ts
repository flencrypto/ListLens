import { auth as clerkAuth } from "@clerk/nextjs/server";
import { DEMO_USER_ID, isClerkConfigured } from "./clerk-config";

/**
 * Drop-in replacement for `import { auth } from "@clerk/nextjs/server"`.
 *
 * When Clerk is configured (real keys in env), this delegates to Clerk's real
 * `auth()` and behaves identically. When Clerk is NOT configured (CI / local /
 * preview / demo mode), it returns a stable demo `userId` so server components
 * and route handlers that call `auth()` keep working without throwing.
 *
 * Only the `userId` field is supplied in the demo branch — that is the only
 * field this codebase reads from `auth()`. If the codebase later starts using
 * `sessionId`, `orgId`, etc., extend this shim accordingly.
 */
export async function auth(): Promise<{ userId: string | null }> {
  if (!isClerkConfigured()) {
    return { userId: DEMO_USER_ID };
  }
  const result = await clerkAuth();
  return { userId: result.userId };
}
