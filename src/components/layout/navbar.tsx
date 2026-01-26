"use client";

import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isGuest, getActualHearts, currentStreak, coins, gems } = useUserStore();
  const hearts = getActualHearts();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-600">BibleQuest</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <HeartsDisplay hearts={hearts} />
          <StreakBadge streak={currentStreak} />
          <CurrencyDisplay coins={coins} gems={gems} />
        </div>

        <div className="flex items-center gap-3">
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
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">U</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
