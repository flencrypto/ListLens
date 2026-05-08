import { z } from "zod";

export const MeasureGarmentSchema = z.object({
  mode: z.literal("measure_garment"),
  sessionId: z.string(),
  measurements: z.object({
    chest_cm: z.number().nullable(),
    waist_cm: z.number().nullable(),
    hip_cm: z.number().nullable(),
    shoulder_width_cm: z.number().nullable(),
    sleeve_length_cm: z.number().nullable(),
    body_length_cm: z.number().nullable(),
    inseam_cm: z.number().nullable(),
  }),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
});
export type MeasureGarment = z.infer<typeof MeasureGarmentSchema>;

export const MeasureMotorSchema = z.object({
  mode: z.literal("measure_motor"),
  sessionId: z.string(),
  measurements: z.object({
    wheelbase_mm: z.number().nullable(),
    track_width_mm: z.number().nullable(),
    overall_length_mm: z.number().nullable(),
    overall_width_mm: z.number().nullable(),
  }),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
});
export type MeasureMotor = z.infer<typeof MeasureMotorSchema>;
