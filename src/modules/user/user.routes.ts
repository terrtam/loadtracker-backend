import { Router } from "express";
import { createUser } from "./user.controller";

const router = Router();

// POST /api/users
router.post("/", createUser);

export default router;
