/**
 * Validation schemas for wellness routes.
 * Ensures wellness-related request data is valid
 * before reaching controllers or services.
 */

import { z } from "zod";

export const createWellnessLogSchema = z.object({
  bodyPartProfileId: z.number().int(),
  painScore: z.number().min(0).max(10),
  fatigueScore: z.number().min(0).max(10),
  loggedAt: z.string().datetime().optional(),
});

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
