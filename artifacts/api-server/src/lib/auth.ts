import * as client from "openid-client";
import crypto from "crypto";
import { type Request, type Response } from "express";
import { pool } from "@workspace/db";
import type { AuthUser } from "@workspace/api-zod";
import { logger } from "./logger";

export const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";
export const SESSION_COOKIE = "sid";
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export interface SessionData {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

let oidcConfig: client.Configuration | null = null;

export async function getOidcConfig(): Promise<client.Configuration> {
  if (!oidcConfig) {
    oidcConfig = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!,
    );
  }
  return oidcConfig;
}

export async function createSession(data: SessionData): Promise<string> {
  const sid = crypto.randomBytes(32).toString("hex");
  const expire = new Date(Date.now() + SESSION_TTL);
  try {
    await pool.query(
      'INSERT INTO sessions (sid, sess, expire) VALUES ($1, $2, $3)',
      [sid, data, expire],
    );
  } catch (err: unknown) {
    const cause = (err as { cause?: unknown })?.cause ?? err;
    logger.error({ err, cause }, "createSession: pool INSERT failed");
    throw err;
  }
  return sid;
}

export async function getSession(sid: string): Promise<SessionData | null> {
  const result = await pool.query<{ sess: SessionData; expire: Date }>(
    'SELECT sess, expire FROM sessions WHERE sid = $1',
    [sid],
  );
  const row = result.rows[0];
  if (!row || row.expire < new Date()) {
    if (row) await deleteSession(sid);
    return null;
  }
  return row.sess;
}

export async function updateSession(
  sid: string,
  data: SessionData,
): Promise<void> {
  const expire = new Date(Date.now() + SESSION_TTL);
  await pool.query(
    'UPDATE sessions SET sess = $1, expire = $2 WHERE sid = $3',
    [data, expire, sid],
  );
}

export async function deleteSession(sid: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE sid = $1', [sid]);
}

export async function clearSession(
  res: Response,
  sid?: string,
): Promise<void> {
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}
