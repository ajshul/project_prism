import type { SceneGeneratorInput, SceneSpec } from "./schemas";
import { apiPost } from "./api";

const MOCK = false;

// Note: legacy helper removed; using centralized apiPost

export const gpt = {
  async generateScene(input: SceneGeneratorInput): Promise<SceneSpec> {
    if (MOCK) {
      return {
        id: "scene_mock_1",
        title: "Hiring Algorithm Kickoff",
        palette: ["#0aa6ff", "#a970ff", "#ff9b2f"],
        tiles: ["office-floor", "console", "whiteboard"],
        characters: ["You (Ethicist)", "PM", "Data Lead"],
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
    return apiPost<SceneSpec>("/api/gpt/scene", input);
  },
};
