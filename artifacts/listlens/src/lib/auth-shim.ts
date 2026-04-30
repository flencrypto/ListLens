/**
 * Demo-mode auth shim. The original Next.js app called Clerk's `auth()` in
 * server components to require a logged-in user. In this Vite/React port we
 * run unauthenticated and resolve to a synthetic demo user so pages render.
 */
export type DemoSession = {
  userId: string | null;
};

export async function auth(): Promise<DemoSession> {
  return { userId: null };
}
