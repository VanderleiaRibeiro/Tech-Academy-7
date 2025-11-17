import { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "admin_only" });
  }

  return next();
}
