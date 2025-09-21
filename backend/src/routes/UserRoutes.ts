import { Router } from "express";
import * as UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/UserModel";

const router = Router();

router.post("/register", UserController.createUser);
router.post("/login", UserController.loginUser);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ message: "Informe o e-mail" });

  let devToken: string | undefined;

  const user = await User.findOne({ where: { email } });
  if (user) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({ reset_token: token, reset_token_expires: expires });

    const base = process.env.FRONT_URL ?? "http://localhost:5173";
    console.log("[RESET LINK DEV]", `${base}/reset?token=${token}`);

    if (process.env.NODE_ENV !== "production") devToken = token;
  }

  return res.json({ ok: true, devToken });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    return res.status(400).json({ message: "Token e nova senha obrigatórios" });
  }

  const user = await User.findOne({ where: { reset_token: token } });
  if (
    !user ||
    !user.reset_token_expires ||
    user.reset_token_expires.getTime() < Date.now()
  ) {
    return res.status(400).json({ message: "Token inválido ou expirado" });
  }

  await user.update({
    password,
    reset_token: null,
    reset_token_expires: null,
  });

  return res.json({ ok: true });
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Informe senha atual e a nova senha." });
  }

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const ok = await user.validatePassword(currentPassword);
  if (!ok) return res.status(401).json({ message: "Senha atual incorreta" });

  await user.update({ password: newPassword });

  return res.json({ ok: true });
});

router.get("/", UserController.getAllUsers);
router.get("/:id", authMiddleware, UserController.getUserById);
router.put("/:id", authMiddleware, UserController.updateUser);
router.delete("/:id", authMiddleware, UserController.destroyUserById);

export default router;
