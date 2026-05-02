import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error(
    "DATABASE_URL or PGHOST must be set. Did you forget to provision a database?",
  );
}

function buildPoolConfig(): pg.PoolConfig {
  if (process.env.PGHOST) {
    const isProduction = process.env.NODE_ENV === "production";
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
}

export const pool = new Pool(buildPoolConfig());
export const db = drizzle(pool, { schema });

export * from "./schema";
