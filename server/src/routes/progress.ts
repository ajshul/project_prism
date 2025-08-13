import express from "express";
import { z } from "zod";

const SaveInput = z.object({
  scenarioId: z.string(),
  state: z.record(z.any()),
});

type SaveInput = z.infer<typeof SaveInput>;

type UserProgressMemory = {
  states: Record<string, Record<string, unknown>>;
  lastScenarioId?: string;
  lastState?: Record<string, unknown> | null;
};

const memory: Record<string, UserProgressMemory> = {};

export const progressRouter = express.Router();

progressRouter.post("/save", (req, res) => {
  const parsed = SaveInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const userKey = "anon";
  if (!memory[userKey]) memory[userKey] = { states: {} };
  memory[userKey].states[parsed.data.scenarioId] = parsed.data.state;
  memory[userKey].lastScenarioId = parsed.data.scenarioId;
  memory[userKey].lastState = parsed.data.state;
  return res.json({ ok: true });
});

progressRouter.get("/:scenarioId", (req, res) => {
  const userKey = "anon";
  const state = memory[userKey]?.states?.[req.params.scenarioId];
  return res.json({ state: state ?? null });
});

progressRouter.get("/last", (req, res) => {
  const userKey = "anon";
  const m = memory[userKey];
  if (!m || !m.lastScenarioId)
    return res.json({ scenarioId: null, state: null });
  return res.json({ scenarioId: m.lastScenarioId, state: m.lastState ?? null });
});
