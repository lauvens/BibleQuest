"use client";

import { Coins, Gem } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  className?: string;
  compact?: boolean;
}

export function CurrencyDisplay({ coins, gems, className, compact = false }: CurrencyDisplayProps) {
  if (compact) {
    return (
      <div className={cn("flex gap-2", className)}>
        <div className="stat-card flex-1">
          <div className="stat-icon bg-gold-100 text-gold-600">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary-500">Pièces</p>
            <p className="font-bold text-primary-800">{formatNumber(coins)}</p>
          </div>
        </div>
        <div className="stat-card flex-1">
          <div className="stat-icon-gems">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary-500">Gemmes</p>
            <p className="font-bold text-primary-800">{formatNumber(gems)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-100 border border-gold-200">
        <Coins className="w-5 h-5 text-gold-600" />
        <span className="font-semibold text-gold-800">{formatNumber(coins)}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info-100 border border-info-200">
        <Gem className="w-5 h-5 text-info-500" />
        <span className="font-semibold text-info-700">{formatNumber(gems)}</span>
      </div>
    </div>
  );
}
