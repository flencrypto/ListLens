import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { db, pool } from "@workspace/db";
import { ebayTokensTable, ebayOauthStateTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  buildEbayAuthUrl,
  exchangeEbayCode,
  getEbayCredentials,
  IS_SANDBOX,
} from "../lib/ebay";

const router: IRouter = Router();

router.get("/ebay/status", async (req, res) => {
  const userId = req.user?.id;
  const creds = getEbayCredentials();

  if (!creds) {
    res.json({
      connected: false,
      credentialsMissing: true,
      sandbox: IS_SANDBOX,
    });
    return;
  }

  if (!userId) {
    res.json({ connected: false, credentialsMissing: false, sandbox: IS_SANDBOX });
    return;
  }

  const row = await db
    .select({ expiresAt: ebayTokensTable.expiresAt })
    .from(ebayTokensTable)
    .where(eq(ebayTokensTable.userId, userId))
    .then((r) => r[0] ?? null);

  res.json({
    connected: !!row,
    expiresAt: row?.expiresAt ?? null,
    sandbox: IS_SANDBOX,
    credentialsMissing: false,
  });
});

router.get("/ebay/connect", async (req, res) => {
  const creds = getEbayCredentials();

  if (!creds) {
    res.status(503).json({
      error: "eBay credentials not configured. Set EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, and EBAY_RU_NAME.",
    });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ error: "You must be logged in to connect eBay." });
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(ebayOauthStateTable).values({
    state,
    userId: req.user.id,
    expiresAt,
  });

  const url = buildEbayAuthUrl(state);
  if (!url) {
    res.status(503).json({ error: "Could not build eBay auth URL." });
    return;
  }

  res.redirect(302, url);
});

router.get("/ebay/callback", async (req, res) => {
  const { code, state, error: oauthError } = req.query as Record<string, string>;

  if (oauthError) {
    logger.warn({ oauthError }, "eBay OAuth error");
    res.redirect("/billing?ebay=error");
    return;
  }

  if (!code || !state) {
    res.status(400).json({ error: "Missing code or state." });
    return;
  }

  const client = await pool.connect();
  let userId: string;
  try {
    const result = await client.query<{ user_id: string }>(
      `UPDATE ebay_oauth_state
       SET used_at = NOW()
       WHERE state = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING user_id`,
      [state],
    );

    if (result.rowCount === 0) {
      res.status(400).json({ error: "Invalid or expired state." });
      return;
    }

    userId = result.rows[0].user_id;

    await client.query(
      `DELETE FROM ebay_oauth_state WHERE expires_at <= NOW()`,
    );
  } finally {
    client.release();
  }

  const tokens = await exchangeEbayCode(code);
  if (!tokens) {
    res.redirect("/billing?ebay=error");
    return;
  }

  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
  await db
    .insert(ebayTokensTable)
    .values({
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
      scope: "sell.inventory",
    })
    .onConflictDoUpdate({
      target: ebayTokensTable.userId,
      set: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
        updatedAt: new Date(),
      },
    });

  logger.info({ userId }, "eBay token stored");
  res.redirect("/billing?ebay=connected");
});

router.post("/ebay/disconnect", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  await db
    .delete(ebayTokensTable)
    .where(eq(ebayTokensTable.userId, userId));
  res.json({ ok: true });
});

export default router;
