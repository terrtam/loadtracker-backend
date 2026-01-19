import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = { id: decoded.id as number };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
