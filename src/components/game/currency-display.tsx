"use client";

import { Coins, Gem } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  className?: string;
}

export function CurrencyDisplay({ coins, gems, className }: CurrencyDisplayProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-1.5">
        <Coins className="w-5 h-5 text-gold-500" />
        <span className="font-medium text-gray-700">{formatNumber(coins)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Gem className="w-5 h-5 text-secondary-500" />
        <span className="font-medium text-gray-700">{formatNumber(gems)}</span>
      </div>
    </div>
  );
}
