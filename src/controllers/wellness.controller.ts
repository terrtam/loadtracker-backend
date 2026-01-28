import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getPainSeries,
  getFatigueSeries,
  createWellnessLog,
  listWellnessLogs,
} from "../services/wellness.service";


export async function createWellness(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { bodyPartProfileId, painScore, fatigueScore, loggedAt } = req.body;

  // Required validation (HTTP concern)
  if (
    bodyPartProfileId === undefined ||
    painScore === undefined ||
    fatigueScore === undefined
  ) {
    return res.status(400).json({
      message: "bodyPartProfileId, painScore, and fatigueScore are required",
    });
  }

  try {
    const log = await createWellnessLog({
      userId,
      bodyPartProfileId,
      painScore,
      fatigueScore,
      loggedAt: loggedAt ? new Date(loggedAt) : undefined,
    });

    res.status(201).json(log);
  } catch (err: any) {
    if (err.message === "BODY_PART_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        message: "Body part profile not found for this user",
      });
    }

    throw err; // let global error middleware handle unexpected errors
  }
}

export async function painSeries(req: AuthRequest, res: Response) {
  const { start, end, aggregation, bodyPartNames } =
    (req as any).parsedQuery;

  const data = await getPainSeries({
    userId: req.user!.id,
    startDate: new Date(start),
    endDate: new Date(end),
    aggregation,
    bodyPartNames,
  });

  res.json(data);
}

export async function fatigueSeries(req: AuthRequest, res: Response) {
  const { start, end, aggregation, bodyPartNames } =
    (req as any).parsedQuery;

  const data = await getFatigueSeries({
    userId: req.user!.id,
    startDate: new Date(start),
    endDate: new Date(end),
    aggregation,
    bodyPartNames,
  });

  res.json(data);
}

export async function listWellness(req: AuthRequest & { parsedQuery?: any }, res: Response) {
  const userId = req.user!.id;
  const { bodyPartProfileId, from, to, limit } = req.parsedQuery || {};

  const logs = await listWellnessLogs({
    userId,
    bodyPartProfileId: bodyPartProfileId
      ? Number(bodyPartProfileId)
      : undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.json(logs);
}