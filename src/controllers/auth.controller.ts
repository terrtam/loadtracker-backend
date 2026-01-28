import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return res.json({ message: "Account deleted successfully" });
}
