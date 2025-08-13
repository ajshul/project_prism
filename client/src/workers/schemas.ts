import { z } from "zod";

export const SceneChoice = z.object({
  id: z.string(),
  label: z.string(),
});

export const SceneSpec = z.object({
  id: z.string(),
  title: z.string(),
  palette: z.array(z.string()).default([]),
  tiles: z.array(z.string()).default([]),
  characters: z.array(z.string()).default([]),
  props: z.array(z.string()).default([]),
  narration: z.string(),
  choices: z.array(SceneChoice),
});

export type SceneSpec = z.infer<typeof SceneSpec>;

export const SceneGeneratorInput = z.object({
  theme: z.string(),
  learningTags: z.array(z.string()),
  persona: z.object({ career: z.string(), style: z.string() }),
  difficulty: z.enum(["starter", "core", "challenge"]).default("starter"),
});

export type SceneGeneratorInput = z.infer<typeof SceneGeneratorInput>;
