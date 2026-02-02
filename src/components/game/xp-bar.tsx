"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { xpForLevel, xpForNextLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface XpBarProps {
  xp: number;
  level: number;
  className?: string;
  compact?: boolean;
  variant?: "default" | "light";
}

export function XpBar({ xp, level, className, compact = false, variant = "default" }: XpBarProps) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const isLight = variant === "light";

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="stat-icon-xp">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1">
          <p className={cn(
            "text-xs",
            isLight ? "text-white/70" : "text-primary-500 dark:text-primary-400"
          )}>Niveau {level}</p>
          <ProgressBar
            value={xpInCurrentLevel}
            max={xpNeededForLevel}
            color="xp"
            size="sm"
            variant={variant}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg",
        isLight
          ? "bg-white/20 text-white"
          : "bg-gradient-to-br from-olive-400 to-olive-600 text-white shadow-soft"
      )}>
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpNeededForLevel}
          color="xp"
          variant={variant}
        />
        <p className={cn(
          "text-xs mt-1.5 font-medium",
          isLight ? "text-white/70" : "text-primary-500 dark:text-primary-400"
        )}>
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </p>
      </div>
    </div>
  );
}
