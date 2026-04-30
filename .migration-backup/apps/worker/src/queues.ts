import { Queue } from "bullmq";
import type IORedis from "ioredis";

export function createQueues(connection: IORedis) {
  const defaultJobOptions = {
    attempts: 3,
    backoff: { type: "exponential" as const, delay: 2000 },
    removeOnComplete: { age: 3600 /* 1 hour */, count: 1000 },
    removeOnFail: { age: 86400 /* 24 hours */ },
  };

  return {
    aiQueue: new Queue("ai", { connection, defaultJobOptions }),
    cvQueue: new Queue("cv", { connection, defaultJobOptions }),
    marketplaceQueue: new Queue("marketplace", { connection, defaultJobOptions }),
    billingQueue: new Queue("billing", { connection, defaultJobOptions }),
    reportQueue: new Queue("report", { connection, defaultJobOptions }),
  };
}

export type Queues = ReturnType<typeof createQueues>;
