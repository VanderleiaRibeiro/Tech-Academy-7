import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies?.authToken;

  if (!token) return res.status(401).json({ error: "Access denied. No token" });

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id)
    return res.status(401).json({ error: "Invalid token" });

  (req as any).user = { id: decoded.id };
  next();
};
