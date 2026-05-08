import * as oidc from "openid-client";
import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { createClerkClient, verifyToken } from "@clerk/backend";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  getSession,
  updateSession,
  upsertClerkUser,
  type SessionData,
} from "../lib/auth";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;

      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

// Lazily-initialised Clerk client — only created when CLERK_SECRET_KEY is set.
let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!process.env["CLERK_SECRET_KEY"]) return null;
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
  }
  return clerkClient;
}

/**
 * Try to authenticate the request via a Clerk JWT bearer token.
 * Returns the resolved AuthUser or null if the token is absent/invalid.
 */
async function tryClerkAuth(req: Request): Promise<AuthUser | null> {
  const clerk = getClerkClient();
  if (!clerk) return null;

  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  let clerkUserId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env["CLERK_SECRET_KEY"],
    });
    if (!payload.sub) return null;
    clerkUserId = payload.sub;
  } catch {
    // Token absent, expired, or invalid — not a Clerk session.
    return null;
  }

  // Resolve full user info: read from DB first; fall back to Clerk Users API.
  return upsertClerkUser(clerkUserId, clerk);
}

async function refreshIfExpired(
  sid: string,
  session: SessionData,
): Promise<SessionData | null> {
  const now = Math.floor(Date.now() / 1000);
  if (!session.expires_at || now <= session.expires_at) return session;

  if (!session.refresh_token) return null;

  try {
    const config = await getOidcConfig();
    const tokens = await oidc.refreshTokenGrant(
      config,
      session.refresh_token,
    );
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token ?? session.refresh_token;
    session.expires_at = tokens.expiresIn()
      ? now + tokens.expiresIn()!
      : session.expires_at;
    await updateSession(sid, session);
    return session;
  } catch {
    return null;
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  // --- Clerk JWT path (takes priority when CLERK_SECRET_KEY is set) ---
  try {
    const clerkUser = await tryClerkAuth(req);
    if (clerkUser) {
      req.user = clerkUser;
      next();
      return;
    }
  } catch (err) {
    logger.warn({ err }, "authMiddleware: Clerk verification threw unexpectedly");
  }

  // --- Replit OIDC session path (existing behaviour) ---
  const sid = getSessionId(req);
  if (!sid) {
    next();
    return;
  }

  const session = await getSession(sid);
  if (!session?.user?.id) {
    await clearSession(res, sid);
    next();
    return;
  }

  const refreshed = await refreshIfExpired(sid, session);
  if (!refreshed) {
    await clearSession(res, sid);
    next();
    return;
  }

  req.user = refreshed.user;
  next();
}
