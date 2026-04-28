import { z } from "zod";

export const MarketplaceConnectorCapabilitiesSchema = z.object({
  marketplace: z.string(),
  canPublish: z.boolean(),
  canFetchListing: z.boolean(),
  canExportCsv: z.boolean(),
  supportedCategories: z.array(z.string()),
  requiredFields: z.array(z.string()),
  optionalFields: z.array(z.string()),
  sandbox: z.boolean(),
});
export type MarketplaceConnectorCapabilities = z.infer<typeof MarketplaceConnectorCapabilitiesSchema>;
