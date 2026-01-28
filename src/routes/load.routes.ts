import { Router } from "express";
import { loadByCategory } from "../controllers/load.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateQuery } from "../middleware/validate.middleware";
import { loadQuerySchema, loadCategorySchema } from "../validators/load.validator";

const router = Router();

router.get(
  "/:category",
  requireAuth,
  validateQuery(loadQuerySchema),
  (req, res, next) => {
    const parsed = loadCategorySchema.safeParse(req.params.category);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid category",
        errors: parsed.error.flatten(),
      });
    }
    next();
  },
  loadByCategory
);

export default router;
