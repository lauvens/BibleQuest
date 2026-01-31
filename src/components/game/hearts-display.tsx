"use client";

import { memo, useState, useEffect } from "react";
import { Heart, Clock } from "lucide-react";
import { cn, getTimeToNextHeart, formatCountdown } from "@/lib/utils";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  heartsUpdatedAt?: Date;
  showTimer?: boolean;
  className?: string;
  compact?: boolean;
}

// Memoize to prevent re-renders when parent state changes - rerender-memo rule
export const HeartsDisplay = memo(function HeartsDisplay({
  hearts,
  maxHearts = 5,
  heartsUpdatedAt,
  showTimer = false,
  className,
  compact = false,
}: HeartsDisplayProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!showTimer || !heartsUpdatedAt || hearts >= maxHearts) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const seconds = getTimeToNextHeart(hearts, heartsUpdatedAt, maxHearts);
      setCountdown(seconds);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [hearts, heartsUpdatedAt, maxHearts, showTimer]);

  if (compact) {
    return (
      <div className={cn("stat-card", className)}>
        <div className="stat-icon-hearts">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <p className="text-xs text-primary-500 dark:text-primary-400">Vies</p>
          <p className="font-bold text-primary-800 dark:text-parchment-100">{hearts}/{maxHearts}</p>
          {countdown !== null && countdown > 0 && (
            <p className="text-xs text-primary-400 dark:text-primary-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatCountdown(countdown)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Heart
            key={i}
            className={cn("w-6 h-6 transition-all duration-300", {
              "fill-error-500 text-error-500 drop-shadow-sm": i < hearts,
              "fill-parchment-300 text-parchment-300 dark:fill-primary-700 dark:text-primary-700": i >= hearts,
            })}
          />
        ))}
      </div>
      {countdown !== null && countdown > 0 && (
        <div className="flex items-center gap-1 text-xs text-primary-400 dark:text-primary-500">
          <Clock className="w-3 h-3" />
          <span>{formatCountdown(countdown)}</span>
        </div>
      )}
    </div>
  );
});
