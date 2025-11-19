import { Pool } from "pg";

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
});

export async function ensureSchema() {
  // cria tabela básica se ainda não existir
  await db.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL
    );
  `);

  // garante as colunas novas mesmo se a tabela já existia
  await db.query(`
    ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS description TEXT;
  `);

  await db.query(`
    ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);

  await db.query(`
    ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);
}
