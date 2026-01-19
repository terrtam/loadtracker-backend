import { z } from "zod";

export const createBodyPartProfileSchema = z.object({
  bodyPartName: z.string().min(1, "Body part name is required"),
  side: z.enum(["left", "right"]),
});

export type CreateBodyPartProfileInput = z.infer<
  typeof createBodyPartProfileSchema
>;
