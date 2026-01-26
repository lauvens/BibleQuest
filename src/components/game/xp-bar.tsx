"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { xpForLevel, xpForNextLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface XpBarProps {
  xp: number;
  level: number;
  className?: string;
}

export function XpBar({ xp, level, className }: XpBarProps) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-xp text-white font-bold text-sm">
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpNeededForLevel}
          color="xp"
        />
        <p className="text-xs text-gray-600 mt-1">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </p>
      </div>
    </div>
  );
}
