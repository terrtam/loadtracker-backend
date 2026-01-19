import type { Request } from "express";

export interface JwtUserPayload {
  id: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
}
