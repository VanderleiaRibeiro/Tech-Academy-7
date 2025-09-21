import { Request, Response } from "express";
import { z } from "zod";
import HabitModel from "../models/HabitModel";
import HabitRecordModel from "../models/HabitRecord";

const habitSchema = z.object({
  name: z.string().trim().min(1, "Nome do hábito é obrigatório"),
  description: z.string().trim().max(500).nullable().optional(),
});

const habitUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

const habitRecordSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida, use formato ISO (YYYY-MM-DD)",
  }),
  completed: z.boolean().optional(),
});

export const createHabit = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const parsed = habitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((e) => e.message) });
    }

    const habit = await HabitModel.create({ ...parsed.data, user_id });
    return res.status(201).json(habit);
  } catch (error) {
    console.error("Erro ao criar hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const listUserHabits = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const habits = await HabitModel.findAll({
      where: { user_id },
      include: [HabitRecordModel],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(habits);
  } catch (error) {
    console.error("Erro ao listar hábitos:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const updateHabit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.id);
    if (isNaN(habitId)) return res.status(400).json({ error: "ID inválido" });

    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });
    if (!habit) return res.status(404).json({ error: "Hábito não encontrado" });

    const parsed = habitUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((e) => e.message) });
    }

    await habit.update(parsed.data);
    return res.status(200).json(habit);
  } catch (error) {
    console.error("Erro ao atualizar hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const deleteHabit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.id);
    if (isNaN(habitId)) return res.status(400).json({ error: "ID inválido" });

    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });
    if (!habit) return res.status(404).json({ error: "Hábito não encontrado" });

    await habit.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const createHabitRecord = async (
  req: Request<{ habitId: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.habitId);
    if (isNaN(habitId)) return res.status(400).json({ error: "ID inválido" });

    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });
    if (!habit) return res.status(404).json({ error: "Hábito não encontrado" });

    const parsed = habitRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((e) => e.message) });
    }

    const { date, completed = true } = parsed.data;

    const existing = await HabitRecordModel.findOne({
      where: { habit_id: habit.id, date },
    });

    if (existing) {
      existing.set({ completed });
      await existing.save();
      return res.status(200).json(existing);
    }

    const record = await HabitRecordModel.create({
      habit_id: habit.id,
      date,
      completed,
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error("Erro ao criar/atualizar registro de hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const listHabitRecords = async (
  req: Request<{ habitId: string }, any, any, { date?: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.habitId);
    if (isNaN(habitId)) return res.status(400).json({ error: "ID inválido" });

    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });
    if (!habit) return res.status(404).json({ error: "Hábito não encontrado" });

    const where: any = { habit_id: habit.id };
    if (req.query?.date) where.date = req.query.date;

    const records = await HabitRecordModel.findAll({
      where,
      order: [["date", "DESC"]],
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Erro ao listar registros de hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const deleteHabitRecordByDate = async (
  req: Request<{ habitId: string }, any, any, { date?: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.habitId);
    if (isNaN(habitId)) return res.status(400).json({ error: "ID inválido" });

    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ error: "Não autorizado" });

    const { date } = req.query;
    if (!date)
      return res.status(400).json({ error: "Informe ?date=YYYY-MM-DD" });

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });
    if (!habit) return res.status(404).json({ error: "Hábito não encontrado" });

    const deleted = await HabitRecordModel.destroy({
      where: { habit_id: habit.id, date },
    });

    return res.status(200).json({ deleted });
  } catch (error) {
    console.error("Erro ao remover registro de hábito:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
