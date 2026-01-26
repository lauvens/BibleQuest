"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium",
        {
          "bg-orange-100 text-orange-600": isActive,
          "bg-gray-100 text-gray-400": !isActive,
        },
        className
      )}
    >
      <Flame
        className={cn("w-5 h-5", {
          "fill-orange-500": isActive,
        })}
      />
      <span>{streak}</span>
    </div>
  );
}
