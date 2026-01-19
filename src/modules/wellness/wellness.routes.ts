import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateQuery } from "../../middleware/validate";
import { wellnessQuerySchema } from "../../validators/wellness.validator";
import {
  painSeries,
  fatigueSeries,
} from "./wellness.controller";

const router = Router();

router.get(
  "/pain/series",
  requireAuth,
  validateQuery(wellnessQuerySchema),
  painSeries
);

router.get(
  "/fatigue/series",
  requireAuth,
  validateQuery(wellnessQuerySchema),
  fatigueSeries
);

export default router;
