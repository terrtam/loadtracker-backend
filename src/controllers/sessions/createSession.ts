import { Response } from "express";
import prisma from "../../prisma/client";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validateSessionSets } from "../../validators/session.validator";

/**
 * POST /api/sessions
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { date, sets } = req.body;

  try {
    // ------------------
    // Validate sets
    // ------------------
    validateSessionSets(sets);

    // ------------------
    // Create session
    // ------------------
    const session = await prisma.session.create({
      data: {
        user_id: userId,
        date: date ? new Date(date) : new Date(),
        sets: {
          create: sets.map((set: any) => ({
            exercise_code: set.exercise_code,
            rpe: set.rpe,
            reps: set.reps ?? null,
            weight: set.weight ?? null,
            duration: set.durationSeconds ?? null, // match IncomingSet
          })),
        },
      },
      include: {
        sets: true,
      },
    });

    res.status(201).json(session);
  } catch (err: any) {
    console.error(err);

    // If validation threw an error, return 400
    if (err instanceof Error && err.message.includes("requires") || err.message.includes("not allowed")) {
      return res.status(400).json({ message: err.message });
    }

    // Fallback: internal server error
    res.status(500).json({ message: "Failed to create session" });
  }
};

export const listSessions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const sessions = await prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { date: "desc" },
      include: {
        sets: true, // include exercise sets
      },
    });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list sessions" });
  }
};