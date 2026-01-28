import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

// Body validation
export const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };

// Query validation (attach parsed query to req.parsedQuery)
export const validateQuery =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    (req as any).parsedQuery = result.data;
    next();
  };
