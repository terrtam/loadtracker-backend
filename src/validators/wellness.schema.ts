import { z } from "zod";

// Validate POST /wellness
export const createWellnessLogSchema = z.object({
  bodyPartProfileId: z.number().int(),
  painScore: z.number().min(0).max(10),
  fatigueScore: z.number().min(0).max(10),
  loggedAt: z.string().datetime().optional(),
});

// Validate GET /wellness query params
export const listWellnessLogsSchema = z.object({
  bodyPartProfileId: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 50)),
});
