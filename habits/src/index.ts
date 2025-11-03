import express, { Request, Response } from "express";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
app.use(express.json());

app.get("/habits/health", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "habits" });
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

const subscriber = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);

subscriber.subscribe("records.created", (err, count) => {
  if (err) {
    console.error("Erro ao inscrever no canal Redis:", err);
  } else {
    console.log(`Inscrito no canal Redis (${count} canais).`);
  }
});

subscriber.on("message", (channel: string, message: string) => {
  if (channel === "records.created") {
    try {
      console.log("Evento recebido no service-habits:", message);
      const data = JSON.parse(message) as { userId: number };
      if (data?.userId) {
        const key = `habits:${data.userId}`;
        redis.del(key);
        console.log(`CACHE INVALIDATE ${key}`);
      }
    } catch (err) {
      console.error("Erro ao processar evento Redis:", err);
    }
  }
});

const TTL_SECONDS = 120;
async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL
    );
  `);
}

app.get("/habits", async (req: Request, res: Response) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) return res.status(400).json({ error: "userId_required" });

  const key = `habits:${userId}`;
  const cached = await redis.get(key);

  if (cached) {
    console.log("CACHE HIT", key);
    return res.json(JSON.parse(cached));
  }

  console.log("CACHE MISS", key);
  const r = await db.query(
    'SELECT id, user_id AS "userId", name FROM habits WHERE user_id=$1 ORDER BY id',
    [userId]
  );

  await redis.setex(key, TTL_SECONDS, JSON.stringify(r.rows));
  return res.json(r.rows);
});

app.post("/habits", async (req: Request, res: Response) => {
  const { userId, name } = req.body ?? {};
  if (!userId || !name)
    return res.status(400).json({ error: "invalid_payload" });

  const r = await db.query<{ id: number }>(
    "INSERT INTO habits(user_id,name) VALUES($1,$2) RETURNING id",
    [userId, name]
  );

  const key = `habits:${userId}`;
  await redis.del(key);
  console.log("CACHE INVALIDATE", key);

  return res.status(201).json({ id: r.rows[0].id, userId, name });
});

ensureSchema().then(() =>
  app.listen(3000, () => console.log("habits up on 3000"))
);
