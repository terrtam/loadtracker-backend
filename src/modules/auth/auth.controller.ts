import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

export async function changePassword(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isValid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return res.json({ message: "Password updated successfully" });
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

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ message: "If the email exists, a reset link was sent" });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);

  // Store token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: tokenHash,
      resetTokenExp: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const resetLink = `${frontendUrl}/reset-password?token=${token}`;


  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: '"My App" <noreply@example.com>',
    to: email,
    subject: "Password Reset",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  return res.json({
    message: "If the email exists, a reset link was sent",
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const users = await prisma.user.findMany({
    where: {
      resetTokenExp: { gt: new Date() },
      resetTokenHash: { not: null },
    },
  });

  let matchedUser = null;

  for (const user of users) {
    const isMatch = await bcrypt.compare(token, user.resetTokenHash!);
    if (isMatch) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    return res
      .status(400)
      .json({ message: "Invalid or expired reset token" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: matchedUser.id },
    data: {
      passwordHash: newHash,
      resetTokenHash: null,
      resetTokenExp: null,
    },
  });

  return res.json({ message: "Password reset successfully" });
}
