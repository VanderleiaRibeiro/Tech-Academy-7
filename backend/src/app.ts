// app.ts
import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import UserRoutes from "./routes/UserRoutes";
import HabitRoutes from "./routes/HabitRoutes";

import User from "./models/UserModel";
import Habit from "./models/HabitModel";
import HabitRecord from "./models/HabitRecord";

// ================== RELACIONAMENTOS ==================
User.hasMany(Habit, { foreignKey: "user_id", onDelete: "CASCADE" });
Habit.belongsTo(User, { foreignKey: "user_id" });

Habit.hasMany(HabitRecord, { foreignKey: "habit_id", onDelete: "CASCADE" });
HabitRecord.belongsTo(Habit, { foreignKey: "habit_id" });

const app = express();

// ================== CORS ==================
const FRONT_URL = process.env.FRONT_URL; // ex: http://localhost:5173
// Permite adicionar origens extras no .env, separadas por vírgula
// ex: CORS_ALLOWED_ORIGINS=http://192.168.0.25:19006,http://192.168.0.25:5173
const CORS_ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Bases explícitas comuns
const ALLOWED_BASE = new Set(
  [
    FRONT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:19006", // Expo Web
    "http://127.0.0.1:19006",
    "http://localhost:8081", // Metro bundler
    "http://127.0.0.1:8081",
    "http://10.0.2.2", // Android emulador
    "http://10.0.3.2", // Genymotion
    "http://host.docker.internal:3001", // se usar Docker no back
    ...CORS_ALLOWED_ORIGINS,
  ].filter(Boolean)
);

// Padrões (regex) aceitos: LAN, faixas privadas, expo tunnel/domínios, localhost, etc.
const allowedRegexes = [
  /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?$/i, // LAN
  /^https?:\/\/10\.\d+\.\d+\.\d+(?::\d+)?$/i, // rede privada 10.x
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?$/i, // rede privada 172.16–31.x
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i,
  /^exp:\/\//i, // scheme do Expo Go
  /^https?:\/\/.*\.expo\.dev(?::\d+)?$/i, // expo tunnel
  /^https?:\/\/.*\.exp\.direct(?::\d+)?$/i, // expo tunnel antigo
  /^https?:\/\/.*\.exponent\.dev(?::\d+)?$/i, // expo legacy
];

function isAllowedOrigin(origin?: string | null) {
  // Apps nativos (React Native/Expo Go), curl, Postman → geralmente sem Origin
  if (!origin) return true;
  if (ALLOWED_BASE.has(origin)) return true;
  return allowedRegexes.some((re) => re.test(origin));
}

const corsOptions: CorsOptions = {
  credentials: true, // só necessário se usar cookies/aut com credenciais
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
};

// (Opcional) log da Origin pra diagnosticar
app.use((req, _res, next) => {
  console.log("REQ ORIGIN ->", req.headers.origin || "(no origin)");
  next();
});

app.use(morgan("dev"));
app.use(cors(corsOptions));
// Pré-flight explícito (opcional, ajuda com alguns proxies)
app.options("*", cors(corsOptions));

// ================== PARSERS ==================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== ROTAS ==================
app.use("/api/users", UserRoutes);
app.use("/api/habits", HabitRoutes);

app.get("/", (_req, res) => {
  res.send("API do Controle de Hábitos funcionando!");
});

export default app;
