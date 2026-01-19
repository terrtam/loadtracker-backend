import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validate";
import {
  createWellnessLogSchema,
  listWellnessLogsSchema,
} from "../validators/wellness.schema";
import { createWellnessLog } from "../controllers/wellness/create";
import { listWellnessLogs } from "../controllers/wellness/list";

const router = Router();

router.post("/", requireAuth, validate(createWellnessLogSchema), createWellnessLog);

router.get("/", requireAuth, validateQuery(listWellnessLogsSchema), listWellnessLogs);

export default router;
