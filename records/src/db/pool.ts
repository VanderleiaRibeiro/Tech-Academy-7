import { Pool } from "pg";

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
});

export async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS habit_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      habit_id INTEGER NOT NULL,
      record_date DATE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uniq_user_habit_day UNIQUE(user_id, habit_id, record_date)
    );
  `);
}
