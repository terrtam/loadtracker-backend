import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  getPainSeries,
  getFatigueSeries,
} from "./wellness.service";

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
