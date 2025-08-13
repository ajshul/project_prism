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

export const StoryProgressInput = z.object({
  sceneId: z.string(),
  choiceId: z.string(),
  priorState: z.record(z.any()).optional(),
});
export type StoryProgressInput = z.infer<typeof StoryProgressInput>;

export const StoryProgressResult = z.object({
  nextScene: SceneSpec,
  checkpoint: z.string(),
  consequences: z.array(z.string()),
  updatedLearningTags: z.array(z.string()),
});
export type StoryProgressResult = z.infer<typeof StoryProgressResult>;

export const AssessmentInput = z.object({
  evidenceEvents: z.array(
    z.union([
      z.object({
        type: z.literal("choice"),
        sceneId: z.string(),
        choiceId: z.string(),
        timestamp: z.number().optional(),
      }),
      z.object({
        type: z.literal("time_on_task"),
        sceneId: z.string(),
        seconds: z.number(),
        timestamp: z.number().optional(),
      }),
      z.object({
        type: z.literal("reflection"),
        text: z.string(),
        tags: z.array(z.string()).default([]),
        timestamp: z.number().optional(),
      }),
      z.object({
        type: z.literal("collab"),
        action: z.enum(["message", "reaction", "review"]),
        targetId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        timestamp: z.number().optional(),
      }),
    ])
  ),
  rubricVersion: z.string(),
  learnerProfile: z.record(z.any()),
  context: z
    .object({
      checkpoint: z.string().nullable().optional(),
      scenarioId: z.string().optional(),
    })
    .optional(),
});
export type AssessmentInput = z.infer<typeof AssessmentInput>;

export const AssessmentResult = z.object({
  observations: z.array(z.string()),
  masteryEstimates: z.record(z.number()),
  difficultyAdjustment: z.enum(["easier", "same", "harder"]),
  recommendations: z.array(z.string()),
});
export type AssessmentResult = z.infer<typeof AssessmentResult>;
