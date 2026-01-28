import prisma from "../prisma/client";

export type Aggregation = "daily" | "weekly";

interface GetWellnessSeriesOpts {
  userId: number;
  startDate: Date;
  endDate: Date;
  aggregation?: Aggregation;
  bodyPartNames?: string[];
}

async function resolveBodyPartProfileIds(
  userId: number,
  bodyPartNames?: string[]
) {
  if (!bodyPartNames?.length) return undefined;

  const profiles = await prisma.bodyPartProfile.findMany({
    where: {
      user_id: userId,
      bodyPartName: { in: bodyPartNames },
      archived: false,
    },
    select: { id: true },
  });

  return profiles.map((p) => p.id);
}

function aggregate(
  rows: { logged_at: Date; value: number }[],
  aggregation: Aggregation
) {
  const buckets = new Map<string, number[]>();

  for (const row of rows) {
    const d = new Date(row.logged_at);
    let key: string;

    if (aggregation === "daily") {
      key = d.toISOString().slice(0, 10);
    } else {
      const utc = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      );
      const day = (utc.getUTCDay() + 6) % 7;
      utc.setUTCDate(utc.getUTCDate() - day);
      key = utc.toISOString().slice(0, 10);
    }

    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(row.value);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      avg: values.reduce((s, v) => s + v, 0) / values.length,
    }));
}

export async function getPainSeries(opts: GetWellnessSeriesOpts) {
  const bodyPartProfileIds = await resolveBodyPartProfileIds(
    opts.userId,
    opts.bodyPartNames
  );

  const logs = await prisma.wellnessLog.findMany({
    where: {
      user_id: opts.userId,
      logged_at: { gte: opts.startDate, lte: opts.endDate },
      ...(bodyPartProfileIds && {
        body_part_profile_id: { in: bodyPartProfileIds },
      }),
    },
    orderBy: { logged_at: "asc" },
    select: {
      logged_at: true,
      pain_score: true,
    },
  });

  return aggregate(
    logs.map((l) => ({ logged_at: l.logged_at, value: l.pain_score })),
    opts.aggregation ?? "daily"
  );
}

export async function getFatigueSeries(opts: GetWellnessSeriesOpts) {
  const bodyPartProfileIds = await resolveBodyPartProfileIds(
    opts.userId,
    opts.bodyPartNames
  );

  const logs = await prisma.wellnessLog.findMany({
    where: {
      user_id: opts.userId,
      logged_at: { gte: opts.startDate, lte: opts.endDate },
      ...(bodyPartProfileIds && {
        body_part_profile_id: { in: bodyPartProfileIds },
      }),
    },
    orderBy: { logged_at: "asc" },
    select: {
      logged_at: true,
      fatigue_score: true,
    },
  });

  return aggregate(
    logs.map((l) => ({ logged_at: l.logged_at, value: l.fatigue_score })),
    opts.aggregation ?? "daily"
  );
}

interface CreateWellnessLogOpts {
  userId: number;
  bodyPartProfileId: number;
  painScore: number;
  fatigueScore: number;
  loggedAt?: Date;
}

export async function createWellnessLog(opts: CreateWellnessLogOpts) {
  // Ownership check
  const bodyPartProfile = await prisma.bodyPartProfile.findFirst({
    where: {
      id: opts.bodyPartProfileId,
      user_id: opts.userId,
      archived: false,
    },
  });

  if (!bodyPartProfile) {
    throw new Error("BODY_PART_PROFILE_NOT_FOUND");
  }

  return prisma.wellnessLog.create({
    data: {
      pain_score: opts.painScore,
      fatigue_score: opts.fatigueScore,
      logged_at: opts.loggedAt ?? new Date(),

      user: { connect: { id: opts.userId } },
      bodyPartProfile: { connect: { id: opts.bodyPartProfileId } },
    },
  });
}

/* ---------------------------
   List wellness logs
----------------------------*/

interface ListWellnessLogsOpts {
  userId: number;
  bodyPartProfileId?: number;
  from?: Date;
  to?: Date;
  limit?: number;
}

export async function listWellnessLogs(opts: ListWellnessLogsOpts) {
  const where: any = { user_id: opts.userId };

  if (opts.bodyPartProfileId) {
    where.body_part_profile_id = opts.bodyPartProfileId;
  }

  if (opts.from || opts.to) {
    where.logged_at = {};
    if (opts.from) where.logged_at.gte = opts.from;
    if (opts.to) where.logged_at.lte = opts.to;
  }

  return prisma.wellnessLog.findMany({
    where,
    orderBy: { logged_at: "desc" },
    take: opts.limit,
    include: {
      bodyPartProfile: {
        select: {
          id: true,
          bodyPartName: true,
          side: true,
        },
      },
    },
  });
}
