import { z } from "zod";

export const MotorLensPartIdentificationSchema = z.object({
  mode: z.literal("motor_part_identification"),
  parts: z.array(z.object({
    partName: z.string(),
    partNumber: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    condition: z.enum(["new", "good", "fair", "poor", "unknown"]),
  })),
  vehicleMake: z.string().nullable(),
  vehicleModel: z.string().nullable(),
  vehicleYear: z.number().int().nullable(),
  warnings: z.array(z.string()),
});
export type MotorLensPartIdentification = z.infer<typeof MotorLensPartIdentificationSchema>;
