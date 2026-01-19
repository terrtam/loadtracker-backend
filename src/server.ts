import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import bodyPartProfileRoutes from "./modules/body-part-profile/body-part-profile.routes";
import { requireAuth, AuthRequest } from "./middleware/auth.middleware";
import sessionRoutes from "./routes/session.routes";
import wellnessRoutes from "./routes/wellness.routes";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const app = express();

/* ===== CONFIG ===== */
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/* ===== MIDDLEWARE ===== */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

/* ===== HEALTH ===== */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/body-part-profiles", requireAuth, bodyPartProfileRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/wellness", wellnessRoutes);

app.get("/api/protected", requireAuth, (req: AuthRequest, res) => {
  res.json({
    message: "Protected route success",
    userId: req.user?.id,
  });
});

/* ===== SERVER ===== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
