"use client";

import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen } from "lucide-react";

export function Navbar() {
  const { isGuest, getActualHearts, currentStreak, coins, gems, username, heartsUpdatedAt } = useUserStore();
  const hearts = getActualHearts();

  return (
    <header className="sticky top-0 z-50 bg-parchment-50/95 dark:bg-primary-900/95 backdrop-blur-sm border-b border-parchment-300 dark:border-primary-800 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary-700 hidden sm:block">
            BibleQuest
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <HeartsDisplay
            hearts={hearts}
            heartsUpdatedAt={heartsUpdatedAt}
            showTimer
          />
          <StreakBadge streak={currentStreak} />
          <CurrencyDisplay coins={coins} gems={gems} />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isGuest ? (
            <>
              <Link href="/connexion">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/inscription">
                <Button size="sm">S&apos;inscrire</Button>
              </Link>
            </>
          ) : (
            <Link href="/profil">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center shadow-soft hover:shadow-card transition-all">
                <span className="text-white font-semibold">
                  {username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
