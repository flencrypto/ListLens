import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./lib/migrate";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const REQUIRED_SECRETS = [
  "XAI_API_KEY",
  "OPENAI_API_KEY",
  "DISCOGS_CONSUMER_KEY",
  "DISCOGS_CONSUMER_SECRET",
] as const;

const missingSecrets = REQUIRED_SECRETS.filter((k) => !process.env[k]);
if (missingSecrets.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingSecrets.join(", ")}. ` +
      `Set them in Replit Secrets before starting the server.`,
  );
}

runMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.warn({ err }, "Startup migration failed — starting server anyway");
    app.listen(port, () => {
      logger.info({ port }, "Server listening (migration skipped)");
    });
  });
