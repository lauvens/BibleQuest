"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Trophy } from "lucide-react";

interface BaseToast {
  id: number;
}

interface SimpleToast extends BaseToast {
  type: "success" | "error";
  message: string;
}

interface AchievementToast extends BaseToast {
  type: "achievement";
  name: string;
  icon: string;
}

type Toast = SimpleToast | AchievementToast;

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
  showAchievementToast: (achievement: { name: string; icon: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const showAchievementToast = useCallback(
    (achievement: { name: string; icon: string }) => {
      const id = nextId++;
      setToasts((prev) => [
        ...prev,
        { id, type: "achievement", name: achievement.name, icon: achievement.icon },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, showAchievementToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
        {toasts.map((toast) => {
          if (toast.type === "achievement") {
            return (
              <div
                key={toast.id}
                className="relative px-5 py-4 rounded-xl shadow-elevated bg-gradient-to-r from-gold-100 to-gold-50 dark:from-gold-900/40 dark:to-gold-800/30 border-2 border-gold-400 dark:border-gold-500 animate-in fade-in slide-in-from-bottom-4 overflow-hidden"
              >
                {/* Shine animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shine_2s_ease-in-out_infinite]" />

                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-200 dark:bg-gold-700/50 flex items-center justify-center text-xl">
                    {toast.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Achievement Unlocked!
                      </span>
                    </div>
                    <p className="font-bold text-primary-800 dark:text-parchment-100">
                      {toast.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={toast.id}
              className={`px-5 py-3 rounded-xl shadow-elevated text-sm font-medium animate-in fade-in slide-in-from-bottom-4 ${
                toast.type === "success"
                  ? "bg-olive-600 text-white"
                  : "bg-error-600 text-white"
              }`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
