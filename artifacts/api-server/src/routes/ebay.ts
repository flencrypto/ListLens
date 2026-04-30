import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { db } from "@workspace/db";
import { ebayTokensTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  buildEbayAuthUrl,
  exchangeEbayCode,
  getEbayCredentials,
  IS_SANDBOX,
} from "../lib/ebay";

const router: IRouter = Router();

const pendingStates = new Map<string, string>();

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

router.get("/ebay/connect", (req, res) => {
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
  pendingStates.set(state, req.user.id);
  setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000);

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

  const userId = pendingStates.get(state);
  if (!userId) {
    res.status(400).json({ error: "Invalid or expired state." });
    return;
  }
  pendingStates.delete(state);

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
