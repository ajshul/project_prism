import { create } from "zustand";

export type Career =
  | "Researcher"
  | "Developer"
  | "Ethicist"
  | "Policy Maker"
  | "Creative"
  | "Entrepreneur";
export type LearningStyle =
  | "Visual"
  | "Analytical"
  | "Collaborative"
  | "Independent"
  | "Creative";

export interface PersonaState {
  career: Career;
  style: LearningStyle;
}

interface PersonaStore {
  persona: PersonaState;
  update: (partial: Partial<PersonaState>) => void;
}

const defaultPersona: PersonaState = {
  career: "Ethicist",
  style: "Analytical",
};

export const usePersonaStore = create<PersonaStore>((set) => ({
  persona: defaultPersona,
  update: (partial) => set((s) => ({ persona: { ...s.persona, ...partial } })),
}));
