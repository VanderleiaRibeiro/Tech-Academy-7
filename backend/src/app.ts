import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import UserRoutes from "./routes/UserRoutes";
import HabitRoutes from "./routes/HabitRoutes";

import User from "./models/UserModel";
import Habit from "./models/HabitModel";
import HabitRecord from "./models/HabitRecord";

User.hasMany(Habit, { foreignKey: "user_id", onDelete: "CASCADE" });
Habit.belongsTo(User, { foreignKey: "user_id" });

Habit.hasMany(HabitRecord, { foreignKey: "habit_id", onDelete: "CASCADE" });
HabitRecord.belongsTo(Habit, { foreignKey: "habit_id" });

const app = express();

const FRONT_URL = process.env.FRONT_URL;

app.use(
  cors({
    origin: FRONT_URL || "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UserRoutes);
app.use("/api/habits", HabitRoutes);

app.get("/", (_req, res) => {
  res.send("API do Controle de Hábitos funcionando!");
});

export default app;
