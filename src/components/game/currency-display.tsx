"use client";

import { memo } from "react";
import { Coins, Gem } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  className?: string;
  compact?: boolean;
}

// Memoize to prevent re-renders when parent state changes - rerender-memo rule
export const CurrencyDisplay = memo(function CurrencyDisplay({ coins, gems, className, compact = false }: CurrencyDisplayProps) {
  if (compact) {
    return (
      <div className={cn("flex gap-2", className)}>
        <div className="stat-card flex-1">
          <div className="stat-icon bg-gold-100 text-gold-600">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary-500 dark:text-primary-400">Pieces</p>
            <p className="font-bold text-primary-800 dark:text-parchment-100">{formatNumber(coins)}</p>
          </div>
        </div>
        <div className="stat-card flex-1">
          <div className="stat-icon-gems">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary-500 dark:text-primary-400">Gemmes</p>
            <p className="font-bold text-primary-800 dark:text-parchment-100">{formatNumber(gems)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-100 dark:bg-gold-900/40 border border-gold-200 dark:border-gold-700">
        <Coins className="w-5 h-5 text-gold-600 dark:text-gold-400" />
        <span className="font-semibold text-gold-800 dark:text-gold-300">{formatNumber(coins)}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info-100 dark:bg-info-900/40 border border-info-200 dark:border-info-700">
        <Gem className="w-5 h-5 text-info-500 dark:text-info-400" />
        <span className="font-semibold text-info-700 dark:text-info-300">{formatNumber(gems)}</span>
      </div>
    </div>
  );
});
