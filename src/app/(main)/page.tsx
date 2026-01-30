"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Target, Trophy, Flame, Scroll, MapPin, Heart, Cross, Book } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/game/xp-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { useUserStore } from "@/lib/store/user-store";
import { getCategoriesWithCounts, getDailyVerse } from "@/lib/supabase/queries";

const iconMap: Record<string, React.ElementType> = {
  scroll: Scroll,
  map: MapPin,
  "book-open": BookOpen,
  church: Cross,
};

const styleMap: Record<string, { bgColor: string; iconColor: string }> = {
  history: { bgColor: "bg-primary-100 dark:bg-primary-900/40", iconColor: "text-primary-600 dark:text-primary-400" },
  context: { bgColor: "bg-olive-100 dark:bg-olive-900/40", iconColor: "text-olive-600 dark:text-olive-400" },
  verses: { bgColor: "bg-info-100 dark:bg-info-900/40", iconColor: "text-info-600 dark:text-info-400" },
  doctrines: { bgColor: "bg-gold-100 dark:bg-gold-900/40", iconColor: "text-gold-700 dark:text-gold-400" },
};

const nameMap: Record<string, { name: string; description: string }> = {
  history: { name: "Histoire", description: "Chronologie biblique" },
  context: { name: "Contexte", description: "Culture et géographie" },
  verses: { name: "Versets", description: "Mémorisation" },
  doctrines: { name: "Doctrines", description: "Fondements de la foi" },
};

export default function HomePage() {
  const {
    isGuest,
    username,
    xp,
    level,
    coins,
    gems,
    currentStreak,
    getActualHearts,
  } = useUserStore();

  const hearts = getActualHearts();

  const [categories, setCategories] = useState<
    { id: string; name_key: string; icon: string; color: string; lessonCount: number }[]
  >([]);
  const [error, setError] = useState(false);
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  const loadData = async () => {
    setError(false);
    try {
      // Parallel fetch - async-parallel rule
      const [categoriesData, verseData] = await Promise.all([
        getCategoriesWithCounts(),
        getDailyVerse().catch(() => null),
      ]);
      setCategories(categoriesData);
      setVerse(verseData);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          {isGuest
            ? "Bienvenue sur BibleQuest!"
            : `Bonjour, ${username || "Utilisateur"}!`}
        </h1>
        <p className="text-primary-500 dark:text-primary-400">
          {isGuest
            ? "Commencez votre voyage biblique dès maintenant"
            : "Continuez votre apprentissage"}
        </p>
      </div>

      {/* Stats Grid - Mobile */}
      <div className="grid grid-cols-2 gap-3 mb-8 md:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center">
                <Flame className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              </div>
              <span className="text-sm text-primary-500 dark:text-primary-400">Serie</span>
            </div>
            <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{currentStreak} jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-error-100 dark:bg-error-900/40 flex items-center justify-center">
                <Heart className="w-4 h-4 text-error-500 dark:text-error-400" />
              </div>
              <span className="text-sm text-primary-500 dark:text-primary-400">Vies</span>
            </div>
            <HeartsDisplay hearts={hearts} />
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
            Votre progression
          </h2>
          <XpBar xp={xp} level={level} />
          <div className="flex items-center justify-between mt-4">
            <CurrencyDisplay coins={coins} gems={gems} />
            <StreakBadge streak={currentStreak} />
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenge CTA */}
      <Card className="mb-8 bg-gradient-to-r from-primary-500 to-primary-700 border-0 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-400 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Défi Quotidien</h2>
              <p className="text-white/80">
                10 questions mixtes pour tester vos connaissances
              </p>
            </div>
            <Link href="/defi">
              <Button variant="gold" className="shadow-elevated">
                <Target className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
        Que voulez-vous apprendre?
      </h2>
      {error && (
        <Card className="mb-4 border-error-200 bg-error-50">
          <CardContent className="p-4 text-center">
            <p className="text-error-600 mb-2">Impossible de charger les catégories.</p>
            <button onClick={loadData} className="text-sm font-medium text-primary-600 hover:underline">
              Réessayer
            </button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || BookOpen;
          const style = styleMap[category.name_key] || { bgColor: "bg-parchment-200 dark:bg-primary-800", iconColor: "text-primary-600 dark:text-primary-400" };
          const names = nameMap[category.name_key] || { name: category.name_key, description: "" };
          return (
            <Link key={category.id} href={`/apprendre?category=${category.name_key}`}>
              <Card variant="interactive" className="h-full">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl ${style.bgColor} flex items-center justify-center mb-3 shadow-soft`}>
                    <Icon className={`w-7 h-7 ${style.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-primary-800 dark:text-parchment-50">{names.name}</h3>
                  <p className="text-xs text-primary-400 dark:text-primary-500 mt-1">
                    {category.lessonCount} lecons
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Leaderboard Preview */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50">Classement</h2>
            <Link
              href="/classement"
              className="text-olive-600 hover:text-olive-700 dark:text-olive-400 dark:hover:text-olive-300 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold-600 dark:text-gold-400" />
            </div>
            <p className="text-primary-600 dark:text-primary-300">
              Competez avec d&apos;autres joueurs et grimpez dans le classement!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guest CTA */}
      {isGuest && (
        <Card className="mt-8 border-2 border-olive-300 dark:border-olive-700 bg-olive-50/50 dark:bg-olive-900/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-olive-100 dark:bg-olive-900/40 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-olive-600 dark:text-olive-400" />
            </div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              Creez un compte pour sauvegarder
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mb-4">
              Votre progression sera perdue si vous ne creez pas de compte
            </p>
            <Link href="/inscription">
              <Button size="lg">Creer un compte gratuit</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Daily Verse */}
      <Card className="mt-8 bg-parchment-100 dark:bg-primary-850 border-parchment-400 dark:border-primary-700">
        <CardContent className="p-6">
          {verse ? (
            <>
              <p className="verse-text text-center mb-3">
                &quot;{verse.text}&quot;
              </p>
              <p className="verse-reference text-center">
                {verse.reference}
              </p>
            </>
          ) : (
            <>
              <p className="verse-text text-center mb-3">
                &quot;Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.&quot;
              </p>
              <p className="verse-reference text-center">
                Psaume 119:105
              </p>
            </>
          )}
          <div className="mt-4 text-center">
            <Link href="/versets">
              <Button variant="outline" size="sm">
                <Book className="w-4 h-4 mr-2" />
                Explorer les versets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
