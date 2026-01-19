import { Router } from "express";
import { listSessions, createSession } from "../controllers/sessions/createSession";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createSession);
router.get("/", requireAuth, listSessions);

export default router;
