import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
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
  try {
    const { name, email, password } = req.body ?? {};

    const trimmedName =
      typeof name === "string" && name.trim().length > 0 ? name.trim() : null;

    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!trimmedEmail || !rawPassword) {
      return res.status(400).json({
        error: "invalid_payload",
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const strongPassword =
      rawPassword.length >= 8 &&
      /[A-Z]/.test(rawPassword) &&
      /\d/.test(rawPassword) &&
      /[@$!%*?&]/.test(rawPassword);

    if (!strongPassword) {
      return res.status(400).json({
        error: "weak_password",
        message:
          "Use pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo.",
      });
    }

    const hash = await bcrypt.hash(rawPassword, 10);
    const role: UserRole = "user";

    try {
      const r = await db.query<{ id: number }>(
        "INSERT INTO users(name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
        [trimmedName, trimmedEmail, hash, role]
      );

      return res.status(201).json({ id: r.rows[0].id });
    } catch (e: any) {
      if (String(e?.message ?? "").includes("duplicate")) {
        return res.status(409).json({
          error: "email_exists",
          message: "E-mail já cadastrado.",
        });
      }
      console.error("Erro ao registrar usuário:", e);
      return res.status(500).json({
        error: "internal_error",
        message: "Erro interno ao registrar usuário.",
      });
    }
  } catch (err) {
    console.error("Erro inesperado em /auth/register:", err);
    return res.status(500).json({
      error: "internal_error",
      message: "Erro inesperado ao registrar usuário.",
    });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  const trimmedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const rawPassword = typeof password === "string" ? password : "";

  if (!trimmedEmail || !rawPassword) {
    return res.status(400).json({
      error: "invalid_payload",
      message: "E-mail e senha são obrigatórios.",
    });
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
    [trimmedEmail]
  );

  if (!r.rows.length) {
    return res.status(401).json({
      error: "invalid_credentials",
      message: "Credenciais inválidas.",
    });
  }

  const dbUser = r.rows[0];

  const ok = await bcrypt.compare(rawPassword, dbUser.password_hash);
  if (!ok) {
    return res.status(401).json({
      error: "invalid_credentials",
      message: "Credenciais inválidas.",
    });
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

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body ?? {};
    const trimmed = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmed || !trimmed.includes("@")) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    const r = await db.query<{ id: number }>(
      "SELECT id FROM users WHERE email = $1",
      [trimmed]
    );

    if (!r.rows.length) {
      return res.json({ ok: true });
    }

    const userId = r.rows[0].id;

    const resetToken = jwt.sign(
      { sub: userId, type: "reset" },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "15m" }
    );

    const devMode = process.env.NODE_ENV !== "production";

    return res.json({
      ok: true,
      ...(devMode ? { devToken: resetToken } : {}),
    });
  } catch (err) {
    console.error("Erro forgot-password:", err);
    return res
      .status(500)
      .json({ message: "Erro interno ao solicitar redefinição." });
  }
});

type ResetPayload = JwtPayload & {
  sub: number | string;
  type?: string;
};

authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body ?? {};
    const rawToken = typeof token === "string" ? token.trim() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!rawToken) {
      return res.status(400).json({ message: "Token é obrigatório." });
    }

    const strongPassword =
      rawPassword.length >= 8 &&
      /[A-Z]/.test(rawPassword) &&
      /\d/.test(rawPassword) &&
      /[@$!%*?&]/.test(rawPassword);

    if (!strongPassword) {
      return res.status(400).json({
        message:
          "Use pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo.",
      });
    }

    const secret: Secret = process.env.JWT_SECRET || "dev-secret";

    let decoded: ResetPayload;
    try {
      decoded = jwt.verify(rawToken, secret) as ResetPayload;
    } catch (err) {
      console.error("Erro ao validar token de reset:", err);
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    if (!decoded.sub || decoded.type !== "reset") {
      return res
        .status(400)
        .json({ message: "Token inválido ou não reconhecido." });
    }

    const userId = Number(decoded.sub);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: "Token inválido." });
    }

    const hash = await bcrypt.hash(rawPassword, 10);

    const updateResult = await db.query(
      `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id
        `,
      [hash, userId]
    );

    if (!updateResult.rows.length) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro em /auth/reset-password:", err);
    return res
      .status(500)
      .json({ message: "Erro interno ao redefinir a senha." });
  }
});

authRouter.post(
  "/change-password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado." });
      }

      const { currentPassword, newPassword } = req.body ?? {};
      const current =
        typeof currentPassword === "string" ? currentPassword.trim() : "";
      const next = typeof newPassword === "string" ? newPassword.trim() : "";

      if (!current || !next) {
        return res.status(400).json({
          message: "Senha atual e nova senha são obrigatórias.",
        });
      }

      const strongPassword =
        next.length >= 8 &&
        /[A-Z]/.test(next) &&
        /\d/.test(next) &&
        /[@$!%*?&]/.test(next);

      if (!strongPassword) {
        return res.status(400).json({
          message:
            "Use pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo.",
        });
      }

      const r = await db.query<{
        id: number;
        password_hash: string;
      }>("SELECT id, password_hash FROM users WHERE id = $1", [req.user.id]);

      if (!r.rows.length) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const dbUser = r.rows[0];

      const ok = await bcrypt.compare(current, dbUser.password_hash);
      if (!ok) {
        return res.status(401).json({ message: "Senha atual incorreta." });
      }

      const newHash = await bcrypt.hash(next, 10);

      await db.query(
        `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
        `,
        [newHash, dbUser.id]
      );

      return res.json({ ok: true });
    } catch (err) {
      console.error("Erro em /auth/change-password:", err);
      return res
        .status(500)
        .json({ message: "Erro interno ao alterar a senha." });
    }
  }
);

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
