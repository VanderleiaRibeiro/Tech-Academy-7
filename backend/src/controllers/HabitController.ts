import { Request, Response } from "express";
import HabitModel from "../models/HabitModel";
import HabitRecordModel from "../models/HabitRecord";

export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Habit name is required" });
    }

    const habit = await HabitModel.create({
      name,
      description: description || null,
      user_id,
    });

    return res.status(201).json(habit);
  } catch (error) {
    console.error("createHabit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listUserHabits = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habits = await HabitModel.findAll({
      where: { user_id },
      include: [HabitRecordModel],
    });

    return res.status(200).json(habits);
  } catch (error) {
    console.error("listUserHabits error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateHabit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.id);
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });

    if (!habit) {
      return res
        .status(404)
        .json({ error: "Habit not found or you do not have permission" });
    }

    const { name, description } = req.body;
    if (name !== undefined) {
      habit.name = name;
    }
    if (description !== undefined) {
      habit.description = description;
    }

    await habit.save();
    return res.status(200).json(habit);
  } catch (error) {
    console.error("updateHabit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteHabit = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.id);
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });

    if (!habit) {
      return res
        .status(404)
        .json({ error: "Habit not found or you do not have permission" });
    }

    await habit.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("deleteHabit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createHabitRecord = async (
  req: Request<{ habitId: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.habitId);
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });

    if (!habit) {
      return res
        .status(404)
        .json({ error: "Habit not found or you do not have permission" });
    }

    const { date, completed } = req.body;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const record = await HabitRecordModel.create({
      habit_id: habit.id,
      date,
      completed: completed ?? true,
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error("createHabitRecord error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listHabitRecords = async (
  req: Request<{ habitId: string }>,
  res: Response
) => {
  try {
    const habitId = Number(req.params.habitId);
    const user_id = (req as any).user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habit = await HabitModel.findOne({ where: { id: habitId, user_id } });

    if (!habit) {
      return res
        .status(404)
        .json({ error: "Habit not found or you do not have permission" });
    }

    const records = await HabitRecordModel.findAll({
      where: { habit_id: habit.id },
    });
    return res.status(200).json(records);
  } catch (error) {
    console.error("listHabitRecords error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
