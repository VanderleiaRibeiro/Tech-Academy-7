import { Router } from "express";
import Redis from "ioredis";
import { db } from "../db/pool.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";

export const recordsRouter = Router();

const redis = new Redis(
  process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "redis"}:${
      process.env.REDIS_PORT || 6379
    }`
);

function isoToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDateParam(req: AuthRequest): string {
  const q = String(req.query.date ?? "").trim();
  if (!q) return isoToday();
  return q;
}

recordsRouter.get(
  "/:habitId/records",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const habitId = Number(req.params.habitId);
    const date = getDateParam(req);

    if (!Number.isFinite(habitId)) {
      return res.status(400).json({ error: "invalid_habit_id" });
    }

    const r = await db.query(
      `
      SELECT
        id,
        user_id AS "userId",
        habit_id AS "habitId",
        record_date AS "date",
        completed,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM habit_records
      WHERE user_id = $1 AND habit_id = $2 AND record_date = $3
      LIMIT 1
      `,
      [userId, habitId, date]
    );

    if (!r.rows.length) {
      return res.json([]);
    }

    return res.json([r.rows[0]]);
  }
);

recordsRouter.post(
  "/:habitId/records",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const habitId = Number(req.params.habitId);
    const date = String(req.body?.date || isoToday());
    const completed = Boolean(req.body?.completed ?? true);

    if (!Number.isFinite(habitId)) {
      return res.status(400).json({ error: "invalid_habit_id" });
    }

    const r = await db.query(
      `
      INSERT INTO habit_records (
        user_id,
        habit_id,
        record_date,
        completed
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, habit_id, record_date)
      DO UPDATE SET 
        completed = EXCLUDED.completed,
        updated_at = NOW()
      RETURNING
        id,
        user_id AS "userId",
        habit_id AS "habitId",
        record_date AS "date",
        completed,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [userId, habitId, date, completed]
    );

    // publicação de eventos pelo Records
    await redis.publish(
      "records.created",
      JSON.stringify({ userId, habitId, date, completed })
    );

    return res.status(201).json(r.rows[0]);
  }
);

recordsRouter.delete(
  "/:habitId/records",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const habitId = Number(req.params.habitId);
    const date = getDateParam(req);

    if (!Number.isFinite(habitId)) {
      return res.status(400).json({ error: "invalid_habit_id" });
    }

    await db.query(
      "DELETE FROM habit_records WHERE user_id = $1 AND habit_id = $2 AND record_date = $3",
      [userId, habitId, date]
    );

    return res.json({ success: true });
  }
);
