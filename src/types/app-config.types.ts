export type ExerciseType =
  | "strength"
  | "cardio"
  | "isometric"
  | "plyometric";

export type SetTypeCode =
  | "reps_weight"
  | "reps"
  | "duration";

/**
 * Body part codes should match config keys
 */
export type BodyPartCode =
  | "chest"
  | "shoulder"
  | "elbow"
  | "back"
  | "spine"
  | "core"
  | "hip"
  | "knee"
  | "ankle";

/**
 * Exercise codes must match ALL exercise keys in config
 */
export type ExerciseCode =
  // Barbell Strength
  | "BARBELL_BACK_SQUAT"
  | "BARBELL_FRONT_SQUAT"
  | "BARBELL_DEADLIFT"
  | "BARBELL_ROMANIAN_DEADLIFT"
  | "BARBELL_BENCH_PRESS"
  | "BARBELL_OVERHEAD_PRESS"
  | "BARBELL_ROW"
  | "BARBELL_POWER_CLEAN"

  // Cardio – Methods
  | "RUN"
  | "CYCLING"
  | "ROWING"
  | "JUMP_ROPE"

  // Cardio – Sports
  | "BASKETBALL"
  | "VOLLEYBALL"
  | "SOCCER"
  | "FOOTBALL"
  | "HOCKEY"

  // Isometric – Tendon Rehab
  | "SPANISH_SQUAT"
  | "ISOMETRIC_SPLIT_SQUAT"
  | "CALF_RAISE_ISO"
  | "HAMSTRING_BRIDGE_ISO"
  | "WALL_PUSH_ISO"
  | "OVERHEAD_CARRY_ISO"
  | "ISOMETRIC_ROW_HOLD"
  | "PLANK_HOLD"

  // Plyometrics
  | "BROAD_JUMP"
  | "BOX_JUMP"
  | "DEPTH_JUMP"
  | "SQUAT_JUMP"
  | "POGO_JUMP"
  | "LATERAL_BOUND"
  | "BOUNDING"
  | "DROP_JUMP"
  | "SPRINT"
  | "TUCK_JUMP";

export interface AppConfig {
  exercises: Record<
    ExerciseCode,
    {
      name: string;
      type: ExerciseType;
      bodyParts: BodyPartCode[];
    }
  >;

  setTypeByExerciseType: Record<ExerciseType, SetTypeCode>;

  setTypes: Record<
    SetTypeCode,
    {
      fields: Record<
        string,
        {
          type: string;
          required: boolean;
        }
      >;
      completionRequires: string[];
    }
  >;
}
