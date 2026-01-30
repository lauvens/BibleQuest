"use client";

import { memo } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
  compact?: boolean;
}

// Memoize to prevent re-renders when parent state changes - rerender-memo rule
export const HeartsDisplay = memo(function HeartsDisplay({
  hearts,
  maxHearts = 5,
  className,
  compact = false,
}: HeartsDisplayProps) {
  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="stat-icon-hearts">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <p className="text-xs text-primary-500">Vies</p>
          <p className="font-bold text-primary-800">{hearts}/{maxHearts}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxHearts }).map((_, i) => (
        <Heart
          key={i}
          className={cn("w-6 h-6 transition-all duration-300", {
            "fill-error-500 text-error-500 drop-shadow-sm": i < hearts,
            "fill-parchment-300 text-parchment-300": i >= hearts,
          })}
        />
      ))}
    </div>
  );
});
