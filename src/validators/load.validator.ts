import { z } from "zod";

export const loadCategorySchema = z.enum([
  "strength",
  "plyometric",
  "isometric",
  "cardio",
]);

export const loadQuerySchema = z.object({
  start: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid start date"),

  end: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid end date"),

  aggregation: z.enum(["daily", "weekly"]),

  bodyPartNames: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",") : undefined)),
});
