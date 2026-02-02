"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
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
