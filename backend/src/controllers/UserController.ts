import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import UserModel from "../models/UserModel";
import { generateToken } from "../utils/jwt";

/* =========================
 * Schemas (Zod)
 * ========================= */
const createUserSchema = z.object({
  // pode ser string válida OU null/undefined (model permite null)
  name: z.string().trim().min(1, "Nome é obrigatório").nullable().optional(),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
    .regex(/(?=.*[@$!%*?&])/, "A senha deve conter pelo menos um caractere especial"),
  url_img: z.string().url("URL inválida").nullable().optional(),
  description: z.string().trim().max(500, "Descrição muito longa").nullable().optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório").nullable().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
      .regex(/(?=.*[@$!%*?&])/, "A senha deve conter pelo menos um caractere especial")
      .optional(),
    url_img: z.string().url("URL inválida").nullable().optional(),
    description: z.string().trim().max(500, "Descrição muito longa").nullable().optional(),
  })
  .strict();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID deve ser numérico"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

/* =========================
 * Helpers
 * ========================= */
function sendZod(res: Response, err: ZodError) {
  return res.status(400).json({
    message: err.issues?.[0]?.message ?? "Dados inválidos",
    issues: err.issues,
  });
}

/* =========================
 * Controllers
 * ========================= */
export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json(users); // toJSON do model já remove password
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await UserModel.findByPk(id);

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.status(200).json(user.toJSON());
  } catch (error) {
    if (error instanceof ZodError) return sendZod(res, error);
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body ?? {};

    // normaliza campos pt/en
    const normalized = {
      name: raw.name ?? raw.nome ?? null,
      email: raw.email,
      password: raw.password ?? raw.senha, // aceita 'senha'
      url_img: raw.url_img ?? raw.foto ?? null,
      description: raw.description ?? raw.descricao ?? null,
    };

    const data = createUserSchema.parse(normalized);

    const existing = await UserModel.findOne({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: "E-mail já cadastrado" });

    const user = await UserModel.create(data);
    return res.status(201).json(user.toJSON());
  } catch (error) {
    if (error instanceof ZodError) return sendZod(res, error);
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body ?? {};
    const payload = loginSchema.parse({
      email: raw.email,
      password: raw.password ?? raw.senha, // aceita 'senha' aqui também
    });

    const user = await UserModel.findOne({
      where: { email: payload.email.trim().toLowerCase() },
    });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const valid = await user.validatePassword(payload.password);
    if (!valid) return res.status(401).json({ message: "Senha inválida" });

    const token = generateToken({ id: user.id, email: user.email });
    return res.json({ user: user.toJSON(), token });
  } catch (error) {
    if (error instanceof ZodError) return sendZod(res, error);
    next(error);
  }
};

export const updateUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const updates = updateUserSchema.parse(req.body);

    const user = await UserModel.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ message: "Somente o proprietário pode atualizar este perfil" });
    }

    Object.assign(user, updates);
    await user.save();

    return res.status(200).json(user.toJSON());
  } catch (error) {
    if (error instanceof ZodError) return sendZod(res, error);
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
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ message: "Somente o proprietário pode excluir a conta" });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    if (error instanceof ZodError) return sendZod(res, error);
    next(error);
  }
};
