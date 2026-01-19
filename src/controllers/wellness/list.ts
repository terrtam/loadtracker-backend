import { Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";

export const listWellnessLogs = async (
  req: AuthRequest & { parsedQuery?: any },
  res: Response
) => {
  const userId = req.user!.id;
  const { bodyPartProfileId, from, to, limit } = req.parsedQuery || {};

  const where: any = { user_id: userId };

  if (bodyPartProfileId) where.body_part_profile_id = bodyPartProfileId;

  if (from || to) {
    where.logged_at = {};
    if (from) where.logged_at.gte = new Date(from);
    if (to) where.logged_at.lte = new Date(to);
  }

const logs = await prisma.wellnessLog.findMany({
  where,
  orderBy: { logged_at: "desc" },
  take: limit ? Number(limit) : undefined,
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


  res.json(logs);
};
