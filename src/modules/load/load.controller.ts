import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getLoadSeries } from "./load.service";

export async function loadByCategory(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { category } = req.params;
  const { start, end, aggregation, bodyPartNames } = (req as any).parsedQuery;

  const data = await getLoadSeries(category as any, {
    userId: req.user.id,
    startDate: new Date(start),
    endDate: new Date(end),
    aggregation,
    bodyPartNames,
  });

  res.json(data);
}
