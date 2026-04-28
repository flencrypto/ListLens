import type { Job } from "bullmq";

export async function handleAiItemAnalyse(job: Job): Promise<Record<string, unknown>> {
  const { itemId, photoUrls, lens } = job.data as {
    itemId: string;
    photoUrls: string[];
    lens?: string;
  };
  console.log(`[ai.item.analyse] jobId=${job.id} itemId=${itemId} lens=${lens ?? "ShoeLens"}`);
  return {
    jobId: job.id,
    itemId,
    status: "completed",
    result: { mode: "studio", lens: lens ?? "ShoeLens", identity: { brand: null, model: null, confidence: 0 } },
  };
}

export async function handleAiGuardCheck(job: Job): Promise<Record<string, unknown>> {
  const { checkId, url, screenshotUrls, lens } = job.data as {
    checkId: string;
    url?: string;
    screenshotUrls?: string[];
    lens?: string;
  };
  console.log(`[ai.guard.check] jobId=${job.id} checkId=${checkId} lens=${lens ?? "ShoeLens"}`);
  return {
    jobId: job.id,
    checkId,
    status: "completed",
    result: { mode: "guard", lens: lens ?? "ShoeLens", risk: { level: "inconclusive", confidence: 0 } },
  };
}

export async function handleAiLensShoeAnalyse(job: Job): Promise<Record<string, unknown>> {
  console.log(`[ai.lens.shoe.analyse] jobId=${job.id}`);
  return { jobId: job.id, status: "completed", lens: "ShoeLens", result: {} };
}

export async function handleAiLensClothingAnalyse(job: Job): Promise<Record<string, unknown>> {
  console.log(`[ai.lens.clothing.analyse] jobId=${job.id}`);
  return { jobId: job.id, status: "completed", lens: "ClothingLens", result: {} };
}

export async function handleAiLensLpAnalyse(job: Job): Promise<Record<string, unknown>> {
  console.log(`[ai.lens.lp.analyse] jobId=${job.id}`);
  return { jobId: job.id, status: "completed", lens: "LPLens", result: {} };
}
