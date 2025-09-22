import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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
const CORS_ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_BASE = new Set(
  [
    FRONT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://10.0.2.2",
    "http://10.0.3.2",
    "http://host.docker.internal:3001",
    ...CORS_ALLOWED_ORIGINS,
  ].filter(Boolean)
);

const allowedRegexes = [
  /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?$/i,
  /^https?:\/\/10\.\d+\.\d+\.\d+(?::\d+)?$/i,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?$/i,
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i,
  /^exp:\/\//i,
  /^https?:\/\/.*\.expo\.dev(?::\d+)?$/i,
  /^https?:\/\/.*\.exp\.direct(?::\d+)?$/i,
  /^https?:\/\/.*\.exponent\.dev(?::\d+)?$/i,
];

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true;
  if (ALLOWED_BASE.has(origin)) return true;
  return allowedRegexes.some((re) => re.test(origin));
}

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
};

app.use((req, _res, next) => {
  console.log("REQ ORIGIN ->", req.headers.origin || "(no origin)");
  next();
});

app.use(morgan("dev"));
app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UserRoutes);
app.use("/api/habits", HabitRoutes);

app.get("/", (_req, res) => {
  res.send("API do Controle de Hábitos funcionando!");
});

export default app;
