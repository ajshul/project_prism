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
