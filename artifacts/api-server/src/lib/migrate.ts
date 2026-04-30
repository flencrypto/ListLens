import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ebay_tokens (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        scope TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR UNIQUE,
        ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS plan_tier VARCHAR NOT NULL DEFAULT 'free';
    `);

    logger.info("Migrations applied successfully");
  } catch (err) {
    logger.warn({ err }, "Migration warning (non-fatal)");
  } finally {
    client.release();
  }
}
