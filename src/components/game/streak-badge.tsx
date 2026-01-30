"use client";

import { memo } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
  compact?: boolean;
}

// Memoize to prevent re-renders when parent state changes - rerender-memo rule
export const StreakBadge = memo(function StreakBadge({ streak, className, compact = false }: StreakBadgeProps) {
  const isActive = streak > 0;

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className={cn("stat-icon", {
          "bg-gold-100 text-gold-600": isActive,
          "bg-parchment-200 text-primary-400": !isActive,
        })}>
          <Flame className={cn("w-5 h-5", { "fill-current": isActive })} />
        </div>
        <div>
          <p className="text-xs text-primary-500 dark:text-primary-400">Serie</p>
          <p className="font-bold text-primary-800 dark:text-parchment-100">{streak} jours</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200",
        {
          "bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 border border-gold-300 dark:border-gold-700": isActive,
          "bg-parchment-200 dark:bg-primary-800/50 text-primary-400 dark:text-primary-500 border border-parchment-300 dark:border-primary-700": !isActive,
        },
        className
      )}
    >
      <Flame
        className={cn("w-5 h-5 transition-colors", {
          "fill-gold-500 text-gold-600": isActive,
        })}
      />
      <span>{streak}</span>
    </div>
  );
});
