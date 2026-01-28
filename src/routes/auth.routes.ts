import { Router } from "express";
import { signup, login, deleteAccount } from "../controllers/auth.controller";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import prisma from "../prisma/client";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("ME route error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
router.delete("/delete-account", requireAuth, deleteAccount);

export default router;
