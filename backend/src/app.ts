import express from "express";
import cors, { CorsOptions } from "cors";
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

// Origens base comuns em desenvolvimento
const ALLOWED_BASE = [
  FRONT_URL,                   // ex: http://localhost:5173 (se usar web)
  "http://localhost:5173",     // Vite/Next/Web local
  "http://localhost:19006",    // Expo Web
  "http://127.0.0.1:19006",
  "http://localhost:8081",     // Metro bundler (RN)
].filter(Boolean) as string[];

// -------- CORS (único) --------
const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    // App nativo (React Native), Postman e curl NÃO enviam Origin → permitir
    if (!origin) return callback(null, true);

    // Permite base + emulador Android + IPs LAN + esquema Expo
    const allowed =
      ALLOWED_BASE.includes(origin) ||
      /^http:\/\/10\.0\.2\.2(?::\d+)?$/i.test(origin) ||        // Android emulador
      /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/i.test(origin) || // LAN (device físico / Expo LAN)
      /^exp:\/\//i.test(origin);                                 // Expo scheme

    return allowed
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS: " + origin));
  },
};

// (opcional) log para diagnosticar a Origin
app.use((req, _res, next) => {
  console.log("REQ ORIGIN ->", req.headers.origin || "(no origin)");
  next();
});

app.use(cors(corsOptions));
// Pré-flight explícito (opcional)
app.options("*", cors(corsOptions));
// -------- fim do CORS --------

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UserRoutes);
app.use("/api/habits", HabitRoutes);

app.get("/", (_req, res) => {
  res.send("API do Controle de Hábitos funcionando!");
});

export default app;
