import { Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createBodyPartProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { bodyPartName, side } = req.body;

  // Basic required-field validation (backend responsibility)
  if (!bodyPartName || !side) {
    return res.status(400).json({
      message: "bodyPartName and side are required",
    });
  }

  // Prevent duplicates
  const existing = await prisma.bodyPartProfile.findFirst({
    where: {
      user_id: userId,
      bodyPartName,
      side,
      archived_at: null,
    },
  });

  if (existing) {
    return res.status(409).json({
      message: "Body part profile already exists",
    });
  }

  const profile = await prisma.bodyPartProfile.create({
    data: {
      user_id: userId,
      bodyPartName,
      side,
    },
  });

  res.status(201).json(profile);
};
