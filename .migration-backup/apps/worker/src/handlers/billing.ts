import type { Job } from "bullmq";

export async function handleBillingCreditConsume(job: Job): Promise<Record<string, unknown>> {
  const { workspaceId, credits, reason } = job.data as {
    workspaceId: string;
    credits: number;
    reason: string;
  };
  console.log(`[billing.credit.consume] jobId=${job.id} workspaceId=${workspaceId} credits=${credits} reason=${reason}`);
  return { jobId: job.id, workspaceId, creditsConsumed: credits, status: "completed" };
}
