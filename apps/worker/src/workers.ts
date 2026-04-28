import { Worker } from "bullmq";
import type IORedis from "ioredis";
import { handleAiItemAnalyse, handleAiGuardCheck, handleAiLensShoeAnalyse, handleAiLensClothingAnalyse, handleAiLensLpAnalyse } from "./handlers/ai";
import { handleCvMeasureCalculate } from "./handlers/cv";
import { handleMarketplaceEbayPublishSandbox, handleMarketplaceCompsRetrieve } from "./handlers/marketplace";
import { handleBillingCreditConsume } from "./handlers/billing";
import { handleReportGeneratePdf } from "./handlers/report";

const workerOptions = {
  concurrency: 5,
};

function createAiWorker(connection: IORedis) {
  return new Worker(
    "ai",
    async (job) => {
      switch (job.name) {
        case "ai.item.analyse": return handleAiItemAnalyse(job);
        case "ai.guard.check": return handleAiGuardCheck(job);
        case "ai.lens.shoe.analyse": return handleAiLensShoeAnalyse(job);
        case "ai.lens.clothing.analyse": return handleAiLensClothingAnalyse(job);
        case "ai.lens.lp.analyse": return handleAiLensLpAnalyse(job);
        default: throw new Error(`Unknown AI job: ${job.name}`);
      }
    },
    { connection, ...workerOptions }
  );
}

function createCvWorker(connection: IORedis) {
  return new Worker(
    "cv",
    async (job) => {
      switch (job.name) {
        case "cv.measure.calculate": return handleCvMeasureCalculate(job);
        default: throw new Error(`Unknown CV job: ${job.name}`);
      }
    },
    { connection, ...workerOptions }
  );
}

function createMarketplaceWorker(connection: IORedis) {
  return new Worker(
    "marketplace",
    async (job) => {
      switch (job.name) {
        case "marketplace.ebay.publishSandbox": return handleMarketplaceEbayPublishSandbox(job);
        case "marketplace.comps.retrieve": return handleMarketplaceCompsRetrieve(job);
        default: throw new Error(`Unknown marketplace job: ${job.name}`);
      }
    },
    { connection, ...workerOptions }
  );
}

function createBillingWorker(connection: IORedis) {
  return new Worker(
    "billing",
    async (job) => {
      switch (job.name) {
        case "billing.credit.consume": return handleBillingCreditConsume(job);
        default: throw new Error(`Unknown billing job: ${job.name}`);
      }
    },
    { connection, ...workerOptions }
  );
}

function createReportWorker(connection: IORedis) {
  return new Worker(
    "report",
    async (job) => {
      switch (job.name) {
        case "report.generatePdf": return handleReportGeneratePdf(job);
        default: throw new Error(`Unknown report job: ${job.name}`);
      }
    },
    { connection, ...workerOptions }
  );
}

export function createAllWorkers(connection: IORedis) {
  return [
    createAiWorker(connection),
    createCvWorker(connection),
    createMarketplaceWorker(connection),
    createBillingWorker(connection),
    createReportWorker(connection),
  ];
}
