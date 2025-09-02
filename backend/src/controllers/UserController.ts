import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import { generateToken } from "../utils/jwt";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(user.toJSON());
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, url_img, description } = req.body;

    if (!email || !emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    if (!password || !passwordRegex.test(password))
      return res.status(400).json({
        error:
          "Password must be at least 8 chars, with uppercase, number, and special char",
      });

    const existing = await UserModel.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const user = await UserModel.create({
      name: name || null,
      email,
      password,
      url_img: url_img || null,
      description: description || null,
    });

    return res.status(201).json(user.toJSON());
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const valid = await user.validatePassword(password);
  if (!valid) return res.status(401).json({ error: "Senha inválida" });

  const token = generateToken({ id: user.id, email: user.email });
  res.json({ user: user.toJSON(), token });
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can update profile" });
    }

    const { name, password, url_img, description } = req.body;

    if (name !== undefined) user.name = name || null;
    if (password !== undefined) {
      if (!passwordRegex.test(password)) {
        return res
          .status(400)
          .json({ error: "Password does not meet requirements" });
      }
      user.password = password;
    }
    if (url_img !== undefined) user.url_img = url_img || null;
    if (description !== undefined) user.description = description || null;

    await user.save();
    return res.status(200).json(user.toJSON());
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const destroyUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can delete account" });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("destroyUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
