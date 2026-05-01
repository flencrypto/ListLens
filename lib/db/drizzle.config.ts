import { defineConfig } from "drizzle-kit";
import path from "path";

function getDbUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.PGHOST) {
    const user = process.env.PGUSER ?? "postgres";
    const password = process.env.PGPASSWORD ? `:${process.env.PGPASSWORD}` : "";
    const host = process.env.PGHOST;
    const port = process.env.PGPORT ?? "5432";
    const db = process.env.PGDATABASE ?? "postgres";
    return `postgresql://${user}${password}@${host}:${port}/${db}`;
  }
  throw new Error("DATABASE_URL or PGHOST must be set. Ensure the database is provisioned.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: getDbUrl(),
  },
});
