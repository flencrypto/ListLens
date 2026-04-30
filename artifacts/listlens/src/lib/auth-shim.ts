// Demo-mode auth shim — replaces the original Clerk `auth()` call.
export type DemoSession = { userId: string | null };

export async function auth(): Promise<DemoSession> {
  return { userId: null };
}
