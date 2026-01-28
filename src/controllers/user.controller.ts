import { Request, Response } from "express";
import prisma from "../../prisma/client";
import bcrypt from "bcryptjs";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Hash the password before storing
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // Never return the password hash
    res.status(201).json({ id: user.id, email: user.email, created_at: user.created_at });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Prisma unique constraint violation
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
