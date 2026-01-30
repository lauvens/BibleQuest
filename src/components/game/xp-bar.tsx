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
}

export function XpBar({ xp, level, className, compact = false }: XpBarProps) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="stat-icon-xp">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-primary-500 dark:text-primary-400">Niveau {level}</p>
          <ProgressBar
            value={xpInCurrentLevel}
            max={xpNeededForLevel}
            color="xp"
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 text-white font-bold text-lg shadow-soft">
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpNeededForLevel}
          color="xp"
        />
        <p className="text-xs text-primary-500 dark:text-primary-400 mt-1.5 font-medium">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </p>
      </div>
    </div>
  );
}
