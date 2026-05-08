import { z } from "zod";

export const LensIdSchema = z
  .string()
  .trim()
  .min(1, "Lens id must be a non-empty string");
export type LensId = z.infer<typeof LensIdSchema>;
