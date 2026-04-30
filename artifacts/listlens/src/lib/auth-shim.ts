// Drop-in shim for the original `auth()` import. In demo mode (no Clerk key)
// returns a stable demo user id so ownership checks stay consistent across
// requests; otherwise returns null until a real Clerk client is wired in.
import { DEMO_USER_ID, isClerkConfigured } from "./clerk-config";

export type DemoSession = { userId: string | null };

export async function auth(): Promise<DemoSession> {
  if (!isClerkConfigured()) {
    return { userId: DEMO_USER_ID };
  }
  return { userId: null };
}
