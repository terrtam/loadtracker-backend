import { z } from "zod";

export const wellnessQuerySchema = z.object({
  start: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid start date"),

  end: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid end date"),

  aggregation: z.enum(["daily", "weekly", "monthly"]).default("daily"),

  bodyPartNames: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",") : undefined)),
});
