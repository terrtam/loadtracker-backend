/**
 * Routes for body part profiles.
 * Includes routes for creating profiles, fetching profiles,
 * and archiving or unarchiving existing profiles.
 * All routes require authentication.
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate} from "../middleware/validate.middleware";
import { createBodyPartProfileSchema } from "../validators/bodyPartProfile.validator";
import { createBodyPartProfile, getBodyPartProfiles, archiveBodyPartProfile, 
  unarchiveBodyPartProfile } from "../controllers/body-part-profile.controller";

const router = Router();

router.post("/", requireAuth, validate(createBodyPartProfileSchema), createBodyPartProfile);
router.get("/", requireAuth, getBodyPartProfiles);
router.patch("/:id/archive", requireAuth, archiveBodyPartProfile);
router.patch("/:id/unarchive", requireAuth, unarchiveBodyPartProfile);

export default router;
