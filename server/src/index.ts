import "dotenv/config";
import express from "express";
import cors from "cors";
import { gptRouter } from "./routes/gpt";
import { personaRouter } from "./routes/persona";
import { progressRouter } from "./routes/progress";

const app = express();
app.use(cors({ origin: [/localhost:\d+$/], credentials: false }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/gpt", gptRouter);
app.use("/api/persona", personaRouter);
app.use("/api/progress", progressRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`AI Literacy Quest server listening on http://localhost:${port}`);
});
