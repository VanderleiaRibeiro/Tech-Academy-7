import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import UserModel from "../models/UserModel";
import { generateToken } from "../utils/jwt";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").nullable().optional(),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
    .regex(
      /(?=.*[@$!%*?&])/,
      "A senha deve conter pelo menos um caractere especial"
    ),
  url_img: z.string().url("URL inválida").nullable().optional(),
  description: z
    .string()
    .trim()
    .max(500, "Descrição muito longa")
    .nullable()
    .optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório").nullable().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(
        /(?=.*[A-Z])/,
        "A senha deve conter pelo menos uma letra maiúscula"
      )
      .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
      .regex(
        /(?=.*[@$!%*?&])/,
        "A senha deve conter pelo menos um caractere especial"
      )
      .optional(),
    url_img: z.string().url("URL inválida").nullable().optional(),
    description: z
      .string()
      .trim()
      .max(500, "Descrição muito longa")
      .nullable()
      .optional(),
  })
  .strict();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID deve ser numérico"),
});

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await UserModel.findByPk(id);

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.status(200).json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await UserModel.findOne({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: "E-mail já está em uso" });
    }

    const user = await UserModel.create(data);
    return res.status(201).json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = generateToken({ id: user.id, email: user.email });
    return res.json({ user: user.toJSON(), token });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const updates = updateUserSchema.parse(req.body);

    const user = await UserModel.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Somente o proprietário pode atualizar este perfil" });
    }

    Object.assign(user, updates);

    await user.save();
    return res.status(200).json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const destroyUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await UserModel.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Somente o proprietário pode excluir a conta" });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
