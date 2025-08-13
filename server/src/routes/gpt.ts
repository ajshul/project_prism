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
import { mockSceneFrom } from "../gpt/tools";

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
      const prompt = `You are a scene generator for a learning game with an 8-bit aesthetic. Output ONLY JSON matching this TS type and nothing else:\n\n{\n  "id": string,\n  "title": string,\n  "palette": string[],\n  "tiles": string[],\n  "characters": string[],\n  "props": string[],\n  "narration": string,\n  "choices": {"id": string, "label": string}[]\n}\n\nConstraints:\n- Keep to short, age-appropriate language (13-15).\n- Use palette colors as hex.\n- Provide 2-4 choices.\n\nInput:\n${JSON.stringify(
        parsed.data
      )}`;

      const response = await openai!.responses.create({
        model: "gpt-5",
        input: prompt,
        text: { verbosity: "low" as any },
        reasoning: { effort: "minimal" as any },
      } as any);

      const textOut =
        (response as any).output_text ??
        (response as any).output
          ?.map((o: any) => o.content?.map((c: any) => c.text).join("\n"))
          .join("\n") ??
        "";

      const json =
        typeof textOut === "string" ? extractFirstJsonBlock(textOut) : null;
      if (json) {
        const validated = SceneSpec.safeParse(json);
        if (validated.success) {
          return res.json(validated.data);
        }
      }
      // Fall through to mock on parse/validate failure
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
      const prompt = `Given sceneId and choiceId, output ONLY JSON matching:\n\n{\n  "nextScene": <SceneSpec>,\n  "checkpoint": string,\n  "consequences": string[],\n  "updatedLearningTags": string[]\n}\n\n<SceneSpec> is the same shape as in scene generation. Keep narration short, with 2-4 choices.\n\nInput: ${JSON.stringify(
        parsed.data
      )}`;
      const response = await openai!.responses.create({
        model: "gpt-5",
        input: prompt,
        text: { verbosity: "low" as any },
        reasoning: { effort: "medium" as any },
      } as any);
      const textOut = (response as any).output_text ?? "";
      const json =
        typeof textOut === "string" ? extractFirstJsonBlock(textOut) : null;
      if (json) {
        const validated = StoryProgressResult.safeParse(json);
        if (validated.success) return res.json(validated.data);
      }
      // fallback to mock
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
      const prompt = `From evidence events, produce ONLY JSON matching:\n\n{\n  "observations": string[],\n  "masteryEstimates": Record<string, number>,\n  "difficultyAdjustment": "easier" | "same" | "harder",\n  "recommendations": string[]\n}\n\nInput: ${JSON.stringify(
        parsed.data
      )}`;
      const response = await openai!.responses.create({
        model: "gpt-5",
        input: prompt,
        text: { verbosity: "low" as any },
        reasoning: { effort: "medium" as any },
      } as any);
      const textOut = (response as any).output_text ?? "";
      const json =
        typeof textOut === "string" ? extractFirstJsonBlock(textOut) : null;
      if (json) {
        const validated = AssessmentResult.safeParse(json);
        if (validated.success) return res.json(validated.data);
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
