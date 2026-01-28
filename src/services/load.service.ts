import prisma from "../prisma/client";
import rawConfig from "../config/app-config.json";
import type { AppConfig, ExerciseCode, ExerciseType } from "../types/app-config.types";

const appConfig = rawConfig as AppConfig;
import { AggregationLevel, LoadCategory, LoadPoint } from "../types/load.types";

type LoadQuery = {
  userId: number;
  startDate: Date;
  endDate: Date;
  aggregation: AggregationLevel;
  bodyPartNames?: string[]; // e.g. ["knee", "ankle"]
};

export async function getLoadSeries(
  category: LoadCategory,
  query: LoadQuery
): Promise<LoadPoint[]> {
  const sessions = await prisma.session.findMany({
    where: {
      user_id: query.userId,
      date: {
        gte: query.startDate,
        lte: query.endDate,
      },
    },
    include: {
      sets: true,
    },
  });

  const buckets = new Map<
    string,
    { volume: number; weightedIntensity: number }
  >();

  for (const session of sessions) {
    const bucketKey =
      query.aggregation === "daily"
        ? session.date.toISOString().slice(0, 10)
        : getWeekStart(session.date);

    for (const set of session.sets) {
      const exerciseCode = set.exercise_code as ExerciseCode;
      const exercise = appConfig.exercises[exerciseCode];

      if (!exercise) continue;
      if (exercise.type !== category) continue;

      // Body part filtering (pre-aggregation)
      if (
        query.bodyPartNames &&
        !exercise.bodyParts.some((bp: string) =>
          query.bodyPartNames!.includes(bp)
        )
      ) {
        continue;
      }

      const volume = getSetVolume(category, set);
      if (volume <= 0) continue;

      const bucket = buckets.get(bucketKey) ?? {
        volume: 0,
        weightedIntensity: 0,
      };

      bucket.volume += volume;

      if (set.rpe != null) {
        bucket.weightedIntensity += volume * set.rpe;
      }

      buckets.set(bucketKey, bucket);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({
      date,
      volume: b.volume,
      intensity:
        b.volume > 0 && b.weightedIntensity > 0
          ? b.weightedIntensity / b.volume
          : null,
    }));
}

function getSetVolume(category: LoadCategory, set: any): number {
  switch (category) {
    case "strength":
      return set.weight && set.reps ? set.weight * set.reps : 0;
    case "plyometric":
      return set.reps ?? 0;
    case "isometric":
    case "cardio":
      return set.duration ?? 0;
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
