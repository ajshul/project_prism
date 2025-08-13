import express from "express";
import OpenAI from "openai/index.mjs";
import { z } from "zod";
import {
  AssessmentInput,
  AssessmentResult,
  SceneGeneratorInput,
  SceneSpec,
  StoryProgressInput,
  StoryProgressResult,
} from "../schemas";
import {
  mockSceneFrom,
  SceneSpecJsonSchema,
  StoryProgressResultJsonSchema,
  AssessmentResultJsonSchema,
} from "../gpt/tools";

function extractFirstJsonBlock(text: string): unknown | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const USE_OPENAI = !!openai && process.env.USE_OPENAI === "1";

export const gptRouter = express.Router();

gptRouter.post("/scene", async (req, res) => {
  const parsed = SceneGeneratorInput.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.format() });
  }
  try {
    if (USE_OPENAI) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const prompt = `You are a scene generator for a learning game with an 8-bit aesthetic. Keep language concise for ages 13-15. Return only valid JSON.\nInput:\n${JSON.stringify(
          parsed.data
        )}`;

        const response = await openai!.responses.create({
          model: "gpt-5",
          input: prompt,
          text: { verbosity: "low" as any },
          reasoning: { effort: "minimal" as any },
          response_format: {
            type: "json_schema",
            json_schema: SceneSpecJsonSchema,
          } as any,
          tool_choice: {
            type: "allowed_tools",
            mode: "auto",
            tools: [],
          } as any,
        } as any);

        const json = (response as any).output
          ? (response as any).output[0]?.content?.[0]?.json ?? null
          : (response as any).output_parsed ?? null;
        if (json) {
          const validated = SceneSpec.safeParse(json);
          if (validated.success) return res.json(validated.data);
        }
      }
    }
    const scene: SceneSpec = mockSceneFrom(parsed.data);
    return res.json(scene);
  } catch (err) {
    return res.status(500).json({ error: "Scene generation failed" });
  }
});

gptRouter.post("/story/progress", async (req, res) => {
  const parsed = StoryProgressInput.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.format() });
  }
  try {
    if (USE_OPENAI) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const prompt = `Given sceneId and choiceId, produce the next scene and checkpoint with concise narration and 2-4 choices. Return only JSON.`;
        const response = await openai!.responses.create({
          model: "gpt-5",
          input: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify(parsed.data) },
          ] as any,
          text: { verbosity: "low" as any },
          reasoning: { effort: "medium" as any },
          response_format: {
            type: "json_schema",
            json_schema: StoryProgressResultJsonSchema,
          } as any,
          tool_choice: {
            type: "allowed_tools",
            mode: "auto",
            tools: [],
          } as any,
        } as any);
        const json = (response as any).output
          ? (response as any).output[0]?.content?.[0]?.json ?? null
          : (response as any).output_parsed ?? null;
        if (json) {
          const validated = StoryProgressResult.safeParse(json);
          if (validated.success) return res.json(validated.data);
        }
      }
    }
    const base = mockSceneFrom({
      theme: "Follow-up",
      learningTags: [],
      persona: { career: "Ethicist", style: "Analytical" },
      difficulty: "starter",
    });
    const result: StoryProgressResult = {
      nextScene: { ...base, id: "scene_mock_2", title: "Stakeholder Workshop" },
      checkpoint: "cp_1",
      consequences: [
        parsed.data.choiceId === "c1"
          ? "You discover historical bias in the dataset."
          : "Stakeholders align on fairness definition.",
      ],
      updatedLearningTags: ["fairness", "bias"],
    };
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Story progression failed" });
  }
});

gptRouter.post("/assess", async (req, res) => {
  const parsed = AssessmentInput.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.format() });
  }
  try {
    if (USE_OPENAI) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const prompt = `Synthesize concise observations and difficulty adjustment for a 13-15 learner from evidence events. Return only JSON.`;
        const response = await openai!.responses.create({
          model: "gpt-5",
          input: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify(parsed.data) },
          ] as any,
          text: { verbosity: "low" as any },
          reasoning: { effort: "medium" as any },
          response_format: {
            type: "json_schema",
            json_schema: AssessmentResultJsonSchema,
          } as any,
          tool_choice: {
            type: "allowed_tools",
            mode: "auto",
            tools: [],
          } as any,
        } as any);
        const json = (response as any).output
          ? (response as any).output[0]?.content?.[0]?.json ?? null
          : (response as any).output_parsed ?? null;
        if (json) {
          const validated = AssessmentResult.safeParse(json);
          if (validated.success) return res.json(validated.data);
        }
      }
    }
    const result: AssessmentResult = {
      observations: [
        "Identified potential bias sources",
        "Engaged stakeholders in metric selection",
      ],
      masteryEstimates: {
        fairness: 0.6,
        bias_detection: 0.55,
        collaboration: 0.5,
      },
      difficultyAdjustment: "same",
      recommendations: [
        "Introduce counterfactual evaluation",
        "Practice metric trade-offs",
      ],
    };
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Assessment synthesis failed" });
  }
});
