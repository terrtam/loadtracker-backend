import rawConfig from "../config/app-config.json";
import type { AppConfig, ExerciseCode, ExerciseType } from "../types/appConfig";
import { z } from "zod";

const appConfig = rawConfig as AppConfig;

/* -------------------------
   Zod field schemas
-------------------------- */

const repsSchema = z.number().int().min(1);
const weightSchema = z.number().min(0);
const durationSchema = z.number().min(0);
const rpeSchema = z.number().min(1).max(10);

/* -------------------------
   Base schema (shared)
-------------------------- */

const baseSetSchema = z.object({
  exercise_code: z.string(),
  rpe: rpeSchema,
});

/* -------------------------
   Set-type schemas
-------------------------- */

const repsWeightSchema = baseSetSchema
  .extend({
    reps: repsSchema,
    weight: weightSchema,
  })
  .strict();

const repsOnlySchema = baseSetSchema
  .extend({
    reps: repsSchema,
  })
  .strict();

const durationSchemaZod = baseSetSchema
  .extend({
    durationSeconds: durationSchema,
  })
  .strict();

/* -------------------------
   Map set type → schema
-------------------------- */

const SET_SCHEMAS = {
  reps_weight: repsWeightSchema,
  reps: repsOnlySchema,
  duration: durationSchemaZod,
} as const;

/* -------------------------
   Inferred type (optional)
-------------------------- */

export type IncomingSet = z.infer<
  (typeof SET_SCHEMAS)[keyof typeof SET_SCHEMAS]
>;

/* -------------------------
   Validation entry point
-------------------------- */

export function validateSessionSets(sets: unknown[]) {
  if (!Array.isArray(sets) || sets.length === 0) {
    throw new Error("Session must contain at least one set");
  }

  for (const rawSet of sets) {
    if (
      typeof rawSet !== "object" ||
      rawSet === null ||
      !("exercise_code" in rawSet)
    ) {
      throw new Error("Invalid set payload");
    }

    const exerciseCode = (rawSet as any)
      .exercise_code as ExerciseCode;

    const exercise = appConfig.exercises[exerciseCode];

    if (!exercise) {
      throw new Error(`Unknown exercise: ${exerciseCode}`);
    }

    const exerciseType = exercise.type as ExerciseType;
    const setType =
      appConfig.setTypeByExerciseType[exerciseType];

    const schema =
      SET_SCHEMAS[setType as keyof typeof SET_SCHEMAS];

    if (!schema) {
      throw new Error(
        `No validation schema for set type ${setType}`
      );
    }

    schema.parse(rawSet);
  }
}
