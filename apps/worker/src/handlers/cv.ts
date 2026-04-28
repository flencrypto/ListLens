import type { Job } from "bullmq";

export async function handleCvMeasureCalculate(job: Job): Promise<Record<string, unknown>> {
  const { sessionId } = job.data as { sessionId: string };
  console.log(`[cv.measure.calculate] jobId=${job.id} sessionId=${sessionId}`);
  return {
    jobId: job.id,
    sessionId,
    status: "completed",
    result: {
      mode: "measure_garment",
      measurements: { chest_cm: null, waist_cm: null },
      confidence: 0.0,
      warnings: ["CV pipeline not yet implemented"],
    },
  };
}
