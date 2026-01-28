import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validate.middleware";
import {
  createWellnessLogSchema,
  listWellnessLogsSchema,
} from "../validators/wellness.schema";
import { wellnessQuerySchema } from "../validators/wellness.validator";
import {
  createWellness,
  listWellness,
  painSeries,
  fatigueSeries,
} from "../controllers/wellness.controller";

const router = Router();

/* -------- CRUD -------- */

router.post(
  "/",
  requireAuth,
  validate(createWellnessLogSchema),
  createWellness
);

router.get(
  "/",
  requireAuth,
  validateQuery(listWellnessLogsSchema),
  listWellness
);

/* -------- Analytics -------- */

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
