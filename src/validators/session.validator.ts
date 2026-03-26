/**
 * Validation logic for session sets.
 * Validates incoming session sets based on exercise
 * configuration and enforces correct set structure
 * before sessions are created.
 */

import rawConfig from "../config/app-config.json";
import type { AppConfig, ExerciseCode, ExerciseType } from "../types/app-config.types";
import { z } from "zod";

const appConfig = rawConfig as AppConfig;

const repsSchema = z.number().int().min(1);
const weightSchema = z.number().min(0);
const durationSchema = z.number().min(0);
const rpeSchema = z.number().min(1).max(10);

const baseSetSchema = z.object({
  exercise_code: z.string(),
  rpe: rpeSchema,
});



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

const SET_SCHEMAS = {
  reps_weight: repsWeightSchema,
  reps: repsOnlySchema,
  duration: durationSchemaZod,
} as const;

export type IncomingSet = z.infer<
  (typeof SET_SCHEMAS)[keyof typeof SET_SCHEMAS]
>;

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
