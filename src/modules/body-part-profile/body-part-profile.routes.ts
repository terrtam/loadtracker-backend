import { Router } from "express";
import {
  createBodyPartProfile,
  getBodyPartProfiles,
  archiveBodyPartProfile,
  unarchiveBodyPartProfile,
} from "./body-part-profile.controller";

const router = Router();

/**
 * POST   /api/body-part-profiles
 * GET    /api/body-part-profiles?archived=false
 */
router.post("/", createBodyPartProfile);
router.get("/", getBodyPartProfiles);

/**
 * PATCH /api/body-part-profiles/:id/archive
 * PATCH /api/body-part-profiles/:id/unarchive
 */
router.patch("/:id/archive", archiveBodyPartProfile);
router.patch("/:id/unarchive", unarchiveBodyPartProfile);

export default router;
