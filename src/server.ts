import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import bodyPartProfileRoutes from "./routes/body-part-profile.routes";
import { requireAuth, AuthRequest } from "./middleware/auth.middleware";
import sessionRoutes from "./routes/session.routes";
import wellnessRoutes from "./routes/wellness.routes";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const app = express();

/* ===== CONFIG ===== */
const PORT = Number(process.env.PORT) || 3000;

/* ===== MIDDLEWARE ===== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
