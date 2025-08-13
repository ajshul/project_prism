import express from "express";
import { z } from "zod";

const Persona = z.object({
  career: z.string(),
  style: z.string(),
});

type Persona = z.infer<typeof Persona>;

const memory: { persona?: Persona } = {};

export const personaRouter = express.Router();

personaRouter.get("/", (_req, res) => {
  return res.json(
    memory.persona ?? { career: "Ethicist", style: "Analytical" }
  );
});

personaRouter.post("/", (req, res) => {
  const parsed = Persona.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid persona" });
  memory.persona = parsed.data;
  return res.json({ ok: true });
});
