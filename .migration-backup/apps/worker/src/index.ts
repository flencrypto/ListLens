import IORedis from "ioredis";
import { createAllWorkers } from "./workers";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

async function main() {
  console.log(`[worker] connecting to Redis at ${REDIS_URL}`);
  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  connection.on("connect", () => console.log("[worker] Redis connected"));
  connection.on("error", (err) => console.error("[worker] Redis error:", err));

  const workers = createAllWorkers(connection);
  console.log(`[worker] started ${workers.length} workers`);

  const shutdown = async () => {
    console.log("[worker] shutting down...");
    await Promise.all(workers.map((w) => w.close()));
    await connection.quit();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("[worker] fatal error:", err);
  process.exit(1);
});
