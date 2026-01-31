import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserState, GuestProgress } from "@/types";
import { calculateHearts, calculateLevel } from "@/lib/utils";
import { useLevelUpStore } from "./level-up-store";

interface UserStore extends UserState {
  // Actions
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  loseHeart: () => boolean;
  buyHeart: () => boolean;
  getActualHearts: () => number;
  updateStreak: () => void;

  // Guest progress
  guestProgress: GuestProgress;
  updateGuestProgress: (lessonId: string, score: number, completed: boolean) => void;
  clearGuestProgress: () => void;
}

const initialUserState: UserState = {
  id: null,
  email: null,
  username: null,
  avatarUrl: null,
  xp: 0,
  level: 1,
  coins: 0,
  gems: 0,
  hearts: 5,
  heartsUpdatedAt: new Date(),
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  role: "user",
  isGuest: true,
};

const initialGuestProgress: GuestProgress = {
  lessonProgress: {},
  xp: 0,
  currentStreak: 0,
  lastActivityDate: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialUserState,
      guestProgress: initialGuestProgress,

      setUser: (user) => set((state) => ({ ...state, ...user, isGuest: false })),

      clearUser: () => set({ ...initialUserState }),

      addXp: (amount) =>
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = calculateLevel(newXp);
          // Trigger level-up modal if level increased
          if (newLevel > state.level) {
            useLevelUpStore.getState().show(newLevel);
          }
          return { xp: newXp, level: newLevel };
        }),

      addCoins: (amount) =>
        set((state) => ({ coins: state.coins + amount })),

      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },

      addGems: (amount) =>
        set((state) => ({ gems: state.gems + amount })),

      spendGems: (amount) => {
        const state = get();
        if (state.gems >= amount) {
          set({ gems: state.gems - amount });
          return true;
        }
        return false;
      },

      loseHeart: () => {
        const state = get();
        const actualHearts = calculateHearts(
          state.hearts,
          state.heartsUpdatedAt
        );
        if (actualHearts > 0) {
          set({
            hearts: actualHearts - 1,
            heartsUpdatedAt: new Date(),
          });
          return true;
        }
        return false;
      },

      buyHeart: () => {
        const state = get();
        const actualHearts = calculateHearts(
          state.hearts,
          state.heartsUpdatedAt
        );
        if (state.coins >= 20 && actualHearts < 5) {
          set({
            coins: state.coins - 20,
            hearts: actualHearts + 1,
            heartsUpdatedAt: new Date(),
          });
          return true;
        }
        return false;
      },

      getActualHearts: () => {
        const state = get();
        return calculateHearts(state.hearts, state.heartsUpdatedAt);
      },

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const lastDate = state.lastActivityDate;

          if (lastDate === today) {
            return state; // Already active today
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          let newStreak = 1;
          if (lastDate === yesterdayStr) {
            newStreak = state.currentStreak + 1;
          }

          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActivityDate: today,
          };
        }),

      updateGuestProgress: (lessonId, score, completed) =>
        set((state) => ({
          guestProgress: {
            ...state.guestProgress,
            lessonProgress: {
              ...state.guestProgress.lessonProgress,
              [lessonId]: {
                completed,
                bestScore: Math.max(
                  state.guestProgress.lessonProgress[lessonId]?.bestScore || 0,
                  score
                ),
              },
            },
          },
        })),

      clearGuestProgress: () =>
        set({ guestProgress: initialGuestProgress }),
    }),
    {
      name: "bibleeido-user",
      partialize: (state) => ({
        guestProgress: state.guestProgress,
      }),
    }
  )
);
