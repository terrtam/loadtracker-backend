export type AggregationLevel = "daily" | "weekly" | "monthly";

export type LoadPoint = {
  date: string;              // ISO date or week start
  volume: number;            // 0 allowed
  intensity: number | null;  // null if no valid RPE
};

export type LoadCategory =
  | "strength"
  | "plyometric"
  | "isometric"
  | "cardio";
