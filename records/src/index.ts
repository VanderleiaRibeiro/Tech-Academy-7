import express from "express";
import { ensureSchema } from "./db/pool.js";
import { recordsRouter } from "./routes/records.routes.js";

const app = express();
app.use(express.json());

app.get("/records/health", (_req, res) => {
  return res.json({ ok: true, service: "records" });
});

app.use("/habits", recordsRouter);

ensureSchema()
  .then(() => {
    app.listen(3000, () => console.log("records up on 3000"));
  })
  .catch((err) => {
    console.error("Erro ao garantir schema de records:", err);
    process.exit(1);
  });
