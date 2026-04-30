/**
 * Demo-mode Clerk shim for the ported web artifact.
 *
 * Real Clerk publishable keys live behind a different stack here; the
 * artifact runs in unauthenticated demo mode, mirroring how the original
 * Next.js app behaves when no Clerk keys are configured.
 */
export function isClerkConfigured(): boolean {
  return false;
}
