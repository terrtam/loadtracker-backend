import { Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createWellnessLog = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { bodyPartProfileId, painScore, fatigueScore, loggedAt } = req.body;

  // Required validation
  if (
    bodyPartProfileId === undefined ||
    painScore === undefined ||
    fatigueScore === undefined
  ) {
    return res.status(400).json({
      message: "bodyPartProfileId, painScore, and fatigueScore are required",
    });
  }

  // Ownership check
  const bodyPartProfile = await prisma.bodyPartProfile.findFirst({
    where: { id: bodyPartProfileId, user_id: userId, archived: false },
  });

  if (!bodyPartProfile) {
    return res.status(404).json({
      message: "Body part profile not found for this user",
    });
  }

  const wellnessLog = await prisma.wellnessLog.create({
    data: {
      pain_score: painScore,
      fatigue_score: fatigueScore,
      logged_at: loggedAt ? new Date(loggedAt) : new Date(),

      user: { connect: { id: userId } },
      bodyPartProfile: { connect: { id: bodyPartProfileId } },
    },
  });

  res.status(201).json(wellnessLog);
};
