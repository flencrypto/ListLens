import type { Job } from "bullmq";

export async function handleCvMeasureCalculate(job: Job): Promise<Record<string, unknown>> {
  const { sessionId } = job.data as { sessionId: string };
  console.log(`[cv.measure.calculate] jobId=${job.id} sessionId=${sessionId}`);
  // Schema-valid stub matching @listlens/schemas MeasureGarmentSchema.
  return {
    jobId: job.id,
    sessionId,
    status: "completed",
    result: {
      mode: "measure_garment",
      sessionId,
      measurements: {
        chest_cm: null,
        waist_cm: null,
        hip_cm: null,
        shoulder_width_cm: null,
        sleeve_length_cm: null,
        body_length_cm: null,
        inseam_cm: null,
      },
      confidence: 0.0,
      warnings: ["CV pipeline not yet implemented"],
    },
  };
}
