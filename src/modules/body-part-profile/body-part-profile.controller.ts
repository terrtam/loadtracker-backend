import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * POST /api/body-part-profiles
 */
export const createBodyPartProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const { bodyPartName, side } = req.body;

  if (!bodyPartName || !side) {
    return res.status(400).json({
      message: "bodyPartName and side are required",
    });
  }

  try {
    const profile = await prisma.bodyPartProfile.create({
      data: {
        user_id: userId,
        bodyPartName,
        side,
      },
    });


    return res.status(201).json(profile);
  } catch (err: any) {
    // Prisma unique constraint violation
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Body part profile already exists",
      });
    }

    console.error(err);
    return res.status(500).json({
      message: "Failed to create body part profile",
    });
  }
};

/**
 * GET /api/body-part-profiles
 */
export const getBodyPartProfiles = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;

  const archived =
    req.query.archived === "true"
      ? true
      : req.query.archived === "false"
      ? false
      : undefined;

  try {
    const profiles = await prisma.bodyPartProfile.findMany({
      where: {
        user_id: userId,
        ...(archived !== undefined && { archived }),
      },
      orderBy: { created_at: "asc" },
    });

    return res.json(profiles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch body part profiles",
    });
  }
};

/**
 * PATCH /api/body-part-profiles/:id/archive
 */
export const archiveBodyPartProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  try {
    const result = await prisma.bodyPartProfile.updateMany({
      where: {
        id: id,
        user_id: userId,
      },
      data: {
        archived: true,
        archived_at: new Date(),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to archive profile",
    });
  }
};


/**
 * PATCH /api/body-part-profiles/:id/unarchive
 */
export const unarchiveBodyPartProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  try {
    const result = await prisma.bodyPartProfile.updateMany({
      where: {
        id: id,
        user_id: userId,
      },
      data: {
        archived: false,
        archived_at: null,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to unarchive profile",
    });
  }
};
