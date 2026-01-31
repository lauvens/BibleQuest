import { create } from "zustand";

interface LevelUpState {
  isOpen: boolean;
  newLevel: number | null;
  show: (level: number) => void;
  hide: () => void;
}

export const useLevelUpStore = create<LevelUpState>((set) => ({
  isOpen: false,
  newLevel: null,

  show: (level: number) => set({ isOpen: true, newLevel: level }),

  hide: () => set({ isOpen: false, newLevel: null }),
}));
