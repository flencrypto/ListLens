import type { Job } from "bullmq";

const STUDIO_DEFAULT_LENS = "ShoeLens";
const GUARD_DISCLAIMER = "AI-assisted risk screen, not formal authentication.";

export async function handleAiItemAnalyse(job: Job): Promise<Record<string, unknown>> {
  const { itemId, photoUrls, lens } = job.data as {
    itemId: string;
    photoUrls: string[];
    lens?: string;
  };
  console.log(`[ai.item.analyse] jobId=${job.id} itemId=${itemId} lens=${lens ?? STUDIO_DEFAULT_LENS}`);
  // Schema-valid stub matching @listlens/schemas StudioOutputSchema.
  return {
    jobId: job.id,
    itemId,
    status: "completed",
    result: {
      mode: "studio",
      lens: lens ?? STUDIO_DEFAULT_LENS,
      identity: { brand: null, model: null, confidence: 0 },
      attributes: {},
      missing_photos: photoUrls.length === 0 ? ["primary"] : [],
      pricing: { quick_sale: 0, recommended: 0, high: 0, currency: "GBP", confidence: 0 },
      marketplace_outputs: { ebay: {}, vinted: {} },
      warnings: ["Stub worker result; no real AI analysis performed."],
    },
  };
}

export async function handleAiGuardCheck(job: Job): Promise<Record<string, unknown>> {
  const { checkId, lens } = job.data as {
    checkId: string;
    url?: string;
    screenshotUrls?: string[];
    lens?: string;
  };
  console.log(`[ai.guard.check] jobId=${job.id} checkId=${checkId} lens=${lens ?? STUDIO_DEFAULT_LENS}`);
  // Schema-valid stub matching @listlens/schemas GuardOutputSchema.
  return {
    jobId: job.id,
    checkId,
    status: "completed",
    result: {
      mode: "guard",
      lens: lens ?? STUDIO_DEFAULT_LENS,
      risk: { level: "inconclusive", confidence: 0 },
      red_flags: [],
      missing_photos: [],
      seller_questions: [],
      disclaimer: GUARD_DISCLAIMER,
    },
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
