import express from "express";
import { ensureSchema } from "./db/pool.js";
import { habitsRouter } from "./routes/habits.routes.js";

const app = express();
app.use(express.json());

app.get("/habits/health", (req, res) => {
  return res.json({ ok: true, service: "habits" });
});

app.use("/habits", habitsRouter);

ensureSchema().then(() => {
  app.listen(3000, () => console.log("habits up on 3000"));
});
