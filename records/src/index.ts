import express from "express";
import Redis from "ioredis";
import { ensureSchema } from "./db/pool.js";
import { recordsRouter } from "./routes/records.routes.js";

const app = express();
app.use(express.json());

const sub = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);

// Se inscreve no canal
sub.subscribe("habit.events", (err) => {
  if (err) {
    console.error("[RECORDS] Erro ao se inscrever no canal habit.events:", err);
  } else {
    console.log("[RECORDS] Subscrito ao canal habit.events ✔️");
  }
});

// Recebe mensagens publicadas pelo serviço Habits
sub.on("message", (channel, message) => {
  console.log("\n📨 [RECORDS] Evento recebido!");
  console.log("Canal:", channel);
  console.log("Payload:", message);
});

app.get("/records/health", (_req, res) => {
  return res.json({ ok: true, service: "records" });
});

app.use("/habits", recordsRouter);

ensureSchema()
  .then(() => {
    app.listen(3000, () => console.log("📡 Records service running on 3000"));
  })
  .catch((err) => {
    console.error("Erro ao garantir schema de records:", err);
    process.exit(1);
  });
