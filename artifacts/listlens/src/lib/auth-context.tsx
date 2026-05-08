/**
 * Unified auth context for ListLens frontend.
 *
 * When Clerk is configured (VITE_CLERK_PUBLISHABLE_KEY is a real key),
 * ClerkAuthProvider supplies auth state from Clerk hooks.
 * Otherwise, ReplitAuthProvider polls /api/auth/user (Replit OIDC session).
 *
 * All consumers import `useAuth` from this module — no Clerk-specific
 * imports leak into page/component code.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import type { AuthUser } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export type { AuthUser };

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// ---------------------------------------------------------------------------
// Clerk-backed provider
// ---------------------------------------------------------------------------

function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { userId, isLoaded, isSignedIn } = useClerkAuth();
  const clerk = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Register Clerk session token as the bearer token for all API calls.
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return (await clerk.session?.getToken()) ?? null;
      } catch {
        return null;
      }
    });
    return () => {
      setAuthTokenGetter(null);
    };
  }, [clerk]);

  // Sync Clerk user → server /api/auth/user whenever session changes.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setUser(null);
      return;
    }

    setIsFetching(true);
    let cancelled = false;

    // The API request carries the Clerk bearer token via setAuthTokenGetter.
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  const login = useCallback(() => {
    clerk.openSignIn();
  }, [clerk]);

  const logout = useCallback(() => {
    clerk.signOut();
  }, [clerk]);

  const value: AuthState = {
    user,
    isLoading: !isLoaded || isFetching,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Replit-OIDC-backed provider (existing behaviour, no Clerk dependency)
// ---------------------------------------------------------------------------

function ReplitAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
    const base = (meta.env?.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export { ClerkAuthProvider, ReplitAuthProvider };

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
