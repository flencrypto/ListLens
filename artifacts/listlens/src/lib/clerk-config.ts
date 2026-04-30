// Demo-mode shim: the ported web artifact runs unauthenticated.
export function isClerkConfigured(): boolean {
  return false;
}
