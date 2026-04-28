import type { Job } from "bullmq";

export async function handleMarketplaceEbayPublishSandbox(job: Job): Promise<Record<string, unknown>> {
  const { listingId } = job.data as { listingId: string };
  console.log(`[marketplace.ebay.publishSandbox] jobId=${job.id} listingId=${listingId}`);
  return { jobId: job.id, listingId, status: "completed", mockEbayId: `ebay-sandbox-${Date.now()}` };
}

export async function handleMarketplaceCompsRetrieve(job: Job): Promise<Record<string, unknown>> {
  const { query } = job.data as { query: string };
  console.log(`[marketplace.comps.retrieve] jobId=${job.id} query=${query}`);
  return { jobId: job.id, query, status: "completed", comps: [] };
}
