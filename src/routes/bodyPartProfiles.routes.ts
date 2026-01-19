import { Router } from "express";
import { createBodyPartProfile } from "../controllers/bodyPartProfiles/create";
import { validate } from "../middleware/validate";
import { createBodyPartProfileSchema } from "../validators/bodyPartProfile.schema";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createBodyPartProfileSchema),
  createBodyPartProfile
);

export default router;
