import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        stripe_customer_id VARCHAR UNIQUE,
        credits INTEGER NOT NULL DEFAULT 0,
        plan_tier VARCHAR NOT NULL DEFAULT 'free',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS studio_items (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR,
        lens VARCHAR NOT NULL DEFAULT 'ShoeLens',
        title VARCHAR,
        status VARCHAR NOT NULL DEFAULT 'analysed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS guard_checks (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR,
        lens VARCHAR NOT NULL DEFAULT 'ShoeLens',
        url VARCHAR,
        risk_level VARCHAR,
        status VARCHAR NOT NULL DEFAULT 'checked',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ebay_oauth_state (
        state VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR,
        lens VARCHAR NOT NULL DEFAULT 'ShoeLens',
        marketplace VARCHAR,
        photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        hint TEXT,
        title TEXT,
        description TEXT,
        price TEXT,
        analysis JSONB,
        status VARCHAR NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ebay_settings (
        user_id VARCHAR PRIMARY KEY,
        shipping_cost VARCHAR NOT NULL DEFAULT '3.99',
        returns_accepted BOOLEAN NOT NULL DEFAULT TRUE,
        return_period VARCHAR NOT NULL DEFAULT 'Days_30',
        payment_method VARCHAR NOT NULL DEFAULT 'PayPal',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    logger.info("Migrations applied successfully");
  } catch (err) {
    logger.warn({ err }, "Migration warning (non-fatal)");
  } finally {
    client.release();
  }
}
