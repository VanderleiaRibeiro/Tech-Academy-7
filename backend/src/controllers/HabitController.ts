import { Request, Response } from "express";
import HabitModel from "../models/HabitModel";
import HabitRecordModel from "../models/HabitRecord";

export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, description, user_id } = req.body;
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

export const listUserHabits = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const habits = await HabitModel.findAll({
      where: { user_id: req.params.userId },
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
    const habit = await HabitModel.findByPk(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const { name, description } = req.body;
    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;

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
    const habit = await HabitModel.findByPk(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

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
    const habit = await HabitModel.findByPk(req.params.habitId);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const { date, completed } = req.body;
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
    const records = await HabitRecordModel.findAll({
      where: { habit_id: req.params.habitId },
    });
    return res.status(200).json(records);
  } catch (error) {
    console.error("listHabitRecords error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
