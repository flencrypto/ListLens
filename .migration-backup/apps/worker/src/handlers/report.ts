import type { Job } from "bullmq";

export async function handleReportGeneratePdf(job: Job): Promise<Record<string, unknown>> {
  const { checkId } = job.data as { checkId: string };
  console.log(`[report.generatePdf] jobId=${job.id} checkId=${checkId}`);
  return { jobId: job.id, checkId, status: "completed", pdfUrl: `https://example.com/reports/${checkId}.pdf` };
}
