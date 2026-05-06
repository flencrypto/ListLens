import { z } from "zod";

export const LensIdSchema = z.enum([
  "ShoeLens",
  "ClothingLens",
  "MeasureLens",
  "RecordLens",
  "LPLens",
  "WatchLens",
  "MotorLens",
  "CardLens",
  "ToyLens",
]);
export type LensId = z.infer<typeof LensIdSchema>;
