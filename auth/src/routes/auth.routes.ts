import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { db, type UserRole } from "../db/pool.js";
import {
  authMiddleware,
  type AuthRequest,
} from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

export const authRouter = Router();

authRouter.get("/health", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "auth" });
});

authRouter.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const hash = await bcrypt.hash(password, 10);
  const role: UserRole = "user";

  try {
    const r = await db.query<{ id: number }>(
      "INSERT INTO users(name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, hash, role]
    );

    return res.status(201).json({ id: r.rows[0].id });
  } catch (e: any) {
    if (String(e?.message ?? "").includes("duplicate")) {
      return res.status(409).json({ error: "email_exists" });
    }
    return res.status(500).json({ error: "internal_error" });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const r = await db.query<{
    id: number;
    name: string | null;
    email: string;
    password_hash: string;
    role: UserRole;
    url_img: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>(
    `
    SELECT 
      id,
      name,
      email,
      password_hash,
      role,
      url_img,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (!r.rows.length) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const dbUser = r.rows[0];

  const ok = await bcrypt.compare(password, dbUser.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const payload = {
    sub: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  };

  const secret: Secret = process.env.JWT_SECRET || "dev-secret";

  const expiresIn = Number(process.env.JWT_EXPIRES ?? 900);

  const token = jwt.sign(payload, secret, { expiresIn });

  return res.json({
    token,
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      url_img: dbUser.url_img,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    },
  });
});

authRouter.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "not_authenticated" });
  }
  return res.json({ user: req.user });
});

authRouter.put(
  "/users/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const paramId = Number(req.params.id);

    if (!Number.isFinite(paramId)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    if (!req.user || (req.user.id !== paramId && req.user.role !== "admin")) {
      return res.status(403).json({ error: "forbidden" });
    }

    const { name } = req.body ?? {};
    const trimmed = String(name ?? "").trim();

    if (!trimmed) {
      return res.status(400).json({ error: "invalid_name" });
    }

    try {
      const result = await db.query<{
        id: number;
        name: string | null;
        email: string;
        role: UserRole;
        url_img: string | null;
        created_at: Date | null;
        updated_at: Date | null;
      }>(
        `
        UPDATE users
        SET name = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, email, role, url_img, created_at, updated_at
        `,
        [trimmed, paramId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: "user_not_found" });
      }

      const updated = result.rows[0];

      return res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        url_img: updated.url_img,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ error: "internal_error" });
    }
  }
);

authRouter.delete(
  "/users/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const paramId = Number(req.params.id);

    if (!Number.isFinite(paramId)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    if (!req.user || (req.user.id !== paramId && req.user.role !== "admin")) {
      return res.status(403).json({ error: "forbidden" });
    }

    try {
      await db.query("DELETE FROM users WHERE id = $1", [paramId]);
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return res.status(500).json({ error: "internal_error" });
    }
  }
);

authRouter.get(
  "/admin/users",
  authMiddleware,
  requireAdmin,
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await db.query<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
      }>("SELECT id, name, email, role FROM users ORDER BY id ASC");

      return res.json({ users: result.rows });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: "internal_error" });
    }
  }
);
