import express, { Request, Response } from "express";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
app.use(express.json());

app.get("/records/health", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "records" });
});

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
});

const redis = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);
const CHANNEL = "records.created";

app.get("/health", (_req, res) => res.json({ ok: true, service: "records" }));

async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      habit_id INTEGER NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT true
    );
  `);
}

app.post("/records", async (req: Request, res: Response) => {
  const { userId, habitId, date, completed = true } = req.body ?? {};
  if (!userId || !habitId || !date)
    return res.status(400).json({ error: "invalid_payload" });

  const r = await db.query<{ id: number }>(
    "INSERT INTO records(user_id,habit_id,date,completed) VALUES($1,$2,$3,$4) RETURNING id",
    [userId, habitId, date, completed]
  );

  const rec = { id: r.rows[0].id, userId, habitId, date, completed };
  await redis.publish(
    CHANNEL,
    JSON.stringify({ type: "records.created", data: rec, ts: Date.now() })
  );
  console.log("EVENT PUBLISHED", CHANNEL, rec);

  return res.status(201).json(rec);
});

ensureSchema().then(() =>
  app.listen(3000, () => console.log("records up on 3000"))
);
