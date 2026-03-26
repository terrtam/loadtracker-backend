/**
 * Routes for wellness tracking.
 * Defines routes for creating and listing wellness logs,
 * as well as fetching pain and fatigue analytics.
 * All routes require authentication.
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { createWellnessLogSchema, listWellnessLogsSchema, 
  wellnessQuerySchema } from "../validators/wellness.validator";
import { createWellness, listWellness, painSeries, 
  fatigueSeries } from "../controllers/wellness.controller";

const router = Router();

router.post("/", requireAuth, validate(createWellnessLogSchema), createWellness);
router.get("/", requireAuth, validateQuery(listWellnessLogsSchema), listWellness);
router.get("/pain/series", requireAuth, validateQuery(wellnessQuerySchema), painSeries);
router.get("/fatigue/series", requireAuth, validateQuery(wellnessQuerySchema), fatigueSeries);

export default router;
