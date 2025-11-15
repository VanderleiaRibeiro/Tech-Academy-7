import express, { Request, Response } from "express";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const app = express();
app.use(express.json());

app.get("/auth/health", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "auth" });
});

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "auth" }));

async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);
}

app.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password)
    return res.status(400).json({ error: "invalid_payload" });

  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await db.query<{ id: number }>(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id",
      [name, email, hash]
    );
    return res.status(201).json({ id: r.rows[0].id });
  } catch (e: any) {
    if (String(e?.message ?? "").includes("duplicate"))
      return res.status(409).json({ error: "email_exists" });
    return res.status(500).json({ error: "internal_error" });
  }
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "invalid_payload" });

  const r = await db.query<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email=$1",
    [email]
  );
  if (!r.rows.length)
    return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const payload = { sub: r.rows[0].id, email };
  const secret: Secret = process.env.JWT_SECRET || "dev-secret";

  type Expires = NonNullable<SignOptions["expiresIn"]>;
  let expiresIn: Expires = 900;

  const envExp = process.env.JWT_EXPIRES;
  if (envExp) {
    const asNumber = Number(envExp);
    expiresIn = Number.isFinite(asNumber) ? asNumber : (envExp as Expires);
  }

  const options: SignOptions = { expiresIn };

  const token = jwt.sign(payload, secret, options);
  return res.json({ token });
});
ensureSchema().then(() =>
  app.listen(3000, () => console.log("auth up on 3000"))
);
