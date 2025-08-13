import type { SceneGeneratorInput, SceneSpec } from "../schemas";

export const sceneGrammar = `
?start: object
?object: "{" pair ("," pair)* "}"
pair: key ":" value
key: ESCAPED_STRING
?array: "[" [value ("," value)*] "]"
?value: ESCAPED_STRING | number | object | array
number: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/

// Intended shape (informative):
// {
//   "id": string,
//   "title": string,
//   "palette": [string, ...],
//   "tiles": [string, ...],
//   "characters": [string, ...],
//   "props": [string, ...],
//   "narration": string,
//   "choices": [{"id": string, "label": string}, ...]
// }
`;

export function mockSceneFrom(input: SceneGeneratorInput): SceneSpec {
  return {
    id: "scene_mock_1",
    title: "Hiring Algorithm Kickoff",
    palette: ["#0aa6ff", "#a970ff", "#ff9b2f"],
    tiles: ["office-floor", "console", "whiteboard"],
    characters: ["You (" + input.persona.career + ")", "PM", "Data Lead"],
    props: ["dataset.csv", "audit-report.md"],
    narration:
      "You are brought in to advise on a hiring algorithm. The team wants speed, but stakeholders worry about fairness. Where do you begin?",
    choices: [
      { id: "c1", label: "Audit existing data for bias" },
      { id: "c2", label: "Define fairness metrics with stakeholders" },
      { id: "c3", label: "Prototype a balanced objective function" },
    ],
  };
}

// JSON Schemas for stricter output constraints (Responses API response_format)
export const SceneSpecJsonSchema = {
  name: "SceneSpec",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      palette: { type: "array", items: { type: "string" } },
      tiles: { type: "array", items: { type: "string" } },
      characters: { type: "array", items: { type: "string" } },
      props: { type: "array", items: { type: "string" } },
      narration: { type: "string" },
      choices: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            label: { type: "string" },
          },
          required: ["id", "label"],
        },
      },
    },
    required: [
      "id",
      "title",
      "palette",
      "tiles",
      "characters",
      "props",
      "narration",
      "choices",
    ],
  },
  strict: true,
} as const;

export const StoryProgressResultJsonSchema = {
  name: "StoryProgressResult",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      nextScene: SceneSpecJsonSchema.schema,
      checkpoint: { type: "string" },
      consequences: { type: "array", items: { type: "string" } },
      updatedLearningTags: { type: "array", items: { type: "string" } },
    },
    required: [
      "nextScene",
      "checkpoint",
      "consequences",
      "updatedLearningTags",
    ],
  },
  strict: true,
} as const;

export const AssessmentResultJsonSchema = {
  name: "AssessmentResult",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      observations: { type: "array", items: { type: "string" } },
      masteryEstimates: {
        type: "object",
        additionalProperties: { type: "number" },
      },
      difficultyAdjustment: {
        type: "string",
        enum: ["easier", "same", "harder"],
      },
      recommendations: { type: "array", items: { type: "string" } },
    },
    required: [
      "observations",
      "masteryEstimates",
      "difficultyAdjustment",
      "recommendations",
    ],
  },
  strict: true,
} as const;
