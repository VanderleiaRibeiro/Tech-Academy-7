import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

type TokenPayload = JwtPayload & {
  sub: string;
  email: string;
  role: UserRole;
};

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_token" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const secret: Secret = process.env.JWT_SECRET || "dev-secret";

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;

    req.user = {
      id: Number(decoded.sub),
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
