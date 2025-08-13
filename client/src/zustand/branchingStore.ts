import { create } from "zustand";
import { apiPost } from "../workers/api";
import type { SceneGeneratorInput, SceneSpec } from "../workers/schemas";

type BranchNode = {
  scene: SceneSpec;
  choiceId?: string;
  checkpoint?: string | null;
  consequences?: string[];
  updatedLearningTags?: string[];
};

type BranchingState = {
  current: SceneSpec | null;
  history: BranchNode[];
  checkpoint: string | null;
  loading: boolean;
  error: string | null;
  initialize: (input: SceneGeneratorInput) => Promise<void>;
  choose: (choiceId: string) => Promise<void>;
  undo: () => void;
  reset: () => void;
};

export const useBranchingStore = create<BranchingState>((set, get) => ({
  current: null,
  history: [],
  checkpoint: null,
  loading: false,
  error: null,

  async initialize(input: SceneGeneratorInput) {
    set({ loading: true, error: null });
    try {
      const scene = await apiPost<SceneSpec>("/api/gpt/scene", input);
      const node: BranchNode = { scene };
      set({ current: scene, history: [node], checkpoint: null });
      // persist initial state
      await apiPost("/api/progress/save", {
        scenarioId: scene.id,
        state: { checkpoint: null, history: [{ sceneId: scene.id }] },
      }).catch(() => {});
    } catch (e) {
      set({ error: "Failed to load scene" });
    } finally {
      set({ loading: false });
    }
  },

  async choose(choiceId: string) {
    const { current, history } = get();
    if (!current) return;
    set({ loading: true, error: null });
    try {
      const prog = await apiPost<{
        nextScene: SceneSpec;
        checkpoint: string;
        consequences: string[];
        updatedLearningTags: string[];
      }>("/api/gpt/story/progress", {
        sceneId: current.id,
        choiceId,
        priorState: {},
      });

      const nextNode: BranchNode = {
        scene: prog.nextScene,
        choiceId,
        checkpoint: prog.checkpoint,
        consequences: prog.consequences,
        updatedLearningTags: prog.updatedLearningTags,
      };

      const nextHistory = [...history, nextNode];
      set({
        current: prog.nextScene,
        checkpoint: prog.checkpoint,
        history: nextHistory,
      });

      // Persist checkpoint and lightweight history pointer
      await apiPost("/api/progress/save", {
        scenarioId: prog.nextScene.id,
        state: {
          checkpoint: prog.checkpoint,
          lastChoiceId: choiceId,
          pathLength: nextHistory.length,
        },
      }).catch(() => {});

      // Fire-and-forget assessment evidence
      await apiPost("/api/gpt/assess", {
        evidenceEvents: [
          {
            type: "choice",
            sceneId: current.id,
            choiceId,
            timestamp: Date.now(),
          },
        ],
        rubricVersion: "v1",
        learnerProfile: {},
        context: { checkpoint: prog.checkpoint, scenarioId: prog.nextScene.id },
      }).catch(() => {});
    } catch (e) {
      set({ error: "Failed to progress story" });
    } finally {
      set({ loading: false });
    }
  },

  undo() {
    const { history } = get();
    if (history.length <= 1) return; // cannot undo initial
    const newHistory = history.slice(0, -1);
    const last = newHistory[newHistory.length - 1];
    set({
      history: newHistory,
      current: last.scene,
      checkpoint: last.checkpoint ?? null,
    });
  },

  reset() {
    set({ current: null, history: [], checkpoint: null, error: null });
  },
}));
