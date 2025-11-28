import { Router } from "express";
import Redis from "ioredis";

import { db } from "../db/pool.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";

export const habitsRouter = Router();

// Redis para cache
const redis = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);

// Redis para mensageria (Pub/Sub)
const pub = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);

const TTL = 120;

function cacheKey(userId: number) {
  return `habits:${userId}`;
}

habitsRouter.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const key = cacheKey(userId);

  const cached = await redis.get(key);
  if (cached) {
    console.log("CACHE HIT", key);
    return res.json(JSON.parse(cached));
  }

  console.log("CACHE MISS", key);

  const result = await db.query(
    `
      SELECT 
        id,
        user_id AS "user_id",
        name,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM habits
      WHERE user_id = $1
      ORDER BY id
    `,
    [userId]
  );

  await redis.setex(key, TTL, JSON.stringify(result.rows));
  return res.json(result.rows);
});

habitsRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { name, description } = req.body ?? {};

  if (!name?.trim()) {
    return res.status(400).json({ error: "invalid_name" });
  }

  const r = await db.query(
    `
      INSERT INTO habits (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, user_id AS "user_id", name, description,
        created_at AS "createdAt", updated_at AS "updatedAt"
    `,
    [userId, name.trim(), description || null]
  );

  // Invalida cache
  await redis.del(cacheKey(userId));

  // Publica evento
  await pub.publish(
    "habit.events",
    JSON.stringify({
      type: "habit.created",
      habitId: r.rows[0].id,
      userId,
      timestamp: Date.now(),
    })
  );

  return res.status(201).json(r.rows[0]);
});

habitsRouter.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }

  const { name, description } = req.body ?? {};
  if (!name?.trim()) {
    return res.status(400).json({ error: "invalid_name" });
  }

  const r = await db.query(
    `
      UPDATE habits
      SET name = $1,
          description = $2,
          updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING id, user_id AS "user_id", name, description,
        created_at AS "createdAt", updated_at AS "updatedAt"
    `,
    [name.trim(), description ?? null, id, userId]
  );

  if (!r.rows.length) {
    return res.status(404).json({ error: "habit_not_found" });
  }

  // Invalida cache
  await redis.del(cacheKey(userId));

  // Evento
  await pub.publish(
    "habit.events",
    JSON.stringify({
      type: "habit.updated",
      habitId: r.rows[0].id,
      userId,
      timestamp: Date.now(),
    })
  );

  return res.json(r.rows[0]);
});

habitsRouter.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "invalid_id" });
  }

  const result = await db.query(
    "DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "habit_not_found" });
  }

  // Invalidar cache
  await redis.del(cacheKey(userId));

  // Evento
  await pub.publish(
    "habit.events",
    JSON.stringify({
      type: "habit.deleted",
      habitId: id,
      userId,
      timestamp: Date.now(),
    })
  );

  return res.status(204).send();
});
