"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryCardsSection } from "@/components/home/category-cards-section";
import { DailyVerseSection } from "@/components/home/daily-verse-section";
import { FadeIn } from "@/components/ui/motion";
import { useUserStore } from "@/lib/store/user-store";
import { getDailyVerse } from "@/lib/supabase/queries";

export default function HomePage() {
  const {
    isGuest,
    username,
    xp,
    level,
    coins,
    gems,
    currentStreak,
  } = useUserStore();

  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  useEffect(() => {
    getDailyVerse()
      .then(setVerse)
      .catch(() => null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Alpha Test Banner */}
      <FadeIn>
        <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm sm:text-base">
                Alpha Test en cours
              </h3>
              <p className="text-amber-700 dark:text-amber-300/80 text-xs sm:text-sm mt-1 leading-relaxed">
                BibleEido est actuellement en phase de test alpha. Toutes les progressions (XP, niveaux, succes, etc.) seront reinitialises lors de la sortie officielle.
              </p>
              <div className="flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 w-fit">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-medium">
                  Les comptes crees durant l&apos;alpha recevront un cosmetique exclusif de Testeur Alpha !
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <HeroSection
        username={username ?? undefined}
        isGuest={isGuest}
        xp={xp}
        level={level}
        coins={coins}
        gems={gems}
        streak={currentStreak}
      />

      <CategoryCardsSection />

      <DailyVerseSection verse={verse} />

      {isGuest && (
        <FadeIn delay={0.4}>
          <div className="rounded-3xl border-2 border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mb-4 max-w-md mx-auto">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button size="lg">Créer un compte gratuit</Button>
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
