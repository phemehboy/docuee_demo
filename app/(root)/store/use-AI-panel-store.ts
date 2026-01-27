import { create } from "zustand";

type AIResult = {
  action: string;
  explanation: string;
  suggestedText?: string;
  stageKey: string;
  isLoading: boolean;
  error?: boolean;
};

type AIPanelStore = {
  isOpen: boolean;
  result: AIResult | null;
  openPanel: (result: AIResult) => void;
  closePanel: () => void;
};

export const useAIPanelStore = create<AIPanelStore>((set) => ({
  isOpen: false,
  result: null,
  openPanel: (result) => set({ isOpen: true, result }),
  closePanel: () => set({ isOpen: false, result: null }),
}));
