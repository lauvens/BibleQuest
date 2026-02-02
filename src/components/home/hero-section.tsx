"use client";

import { Flame, Coins, Gem } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { XpBar } from "@/components/game/xp-bar";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  username?: string;
  isGuest: boolean;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
}

export function HeroSection({
  username,
  isGuest,
  xp,
  level,
  coins,
  gems,
  streak,
}: HeroSectionProps) {
  return (
    <FadeIn className="mb-12">
      <div className="rounded-3xl bg-gradient-to-br from-primary-800 to-primary-900 dark:from-primary-900 dark:to-primary-850 p-8 text-white shadow-elevated">
        {/* Welcome */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isGuest ? "Bienvenue sur BibleEido!" : `Bonjour, ${username || "Ami"}!`}
        </h1>
        <p className="text-white/70 mb-6">
          {isGuest
            ? "Commencez votre voyage biblique"
            : "Continuez votre apprentissage"}
        </p>

        {/* XP Progress - Large */}
        <div className="mb-6">
          <XpBar xp={xp} level={level} variant="light" />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Streak */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            streak > 0
              ? "bg-gold-400/20 border border-gold-400/30"
              : "bg-white/10 border border-white/10"
          )}>
            <Flame className={cn(
              "w-5 h-5",
              streak > 0 ? "text-gold-400 fill-gold-400" : "text-white/50"
            )} />
            <span className="font-semibold">{streak} jours</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Coins className="w-5 h-5 text-gold-400" />
            <span className="font-semibold">{coins}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Gem className="w-5 h-5 text-accent-400" />
            <span className="font-semibold">{gems}</span>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
