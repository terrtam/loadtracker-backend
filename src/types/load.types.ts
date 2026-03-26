/**
 * Shared types for load data.
 * Defines load categories, aggregation levels,
 * and the structure of aggregated load points.
 */

export type AggregationLevel = "daily" | "weekly" | "monthly";

export type LoadPoint = {
  date: string;
  volume: number;
  intensity: number | null;
};

export type LoadCategory =
  | "strength"
  | "plyometric"
  | "isometric"
  | "cardio";
