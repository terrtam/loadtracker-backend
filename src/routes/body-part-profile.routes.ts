import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate} from "../middleware/validate.middleware";
import { createBodyPartProfileSchema } from "../validators/bodyPartProfile.schema";
import {
  createBodyPartProfile,
  getBodyPartProfiles,
  archiveBodyPartProfile,
  unarchiveBodyPartProfile,
} from "../controllers/body-part-profile.controller";

const router = Router();

/**
 * POST /api/body-part-profiles
 * GET  /api/body-part-profiles?archived=false
 */
router.post(
  "/",
  requireAuth,
  validate(createBodyPartProfileSchema),
  createBodyPartProfile
);

router.get(
  "/",
  requireAuth,
  getBodyPartProfiles
);

/**
 * PATCH /api/body-part-profiles/:id/archive
 * PATCH /api/body-part-profiles/:id/unarchive
 */
router.patch(
  "/:id/archive",
  requireAuth,
  archiveBodyPartProfile
);

router.patch(
  "/:id/unarchive",
  requireAuth,
  unarchiveBodyPartProfile
);

export default router;
