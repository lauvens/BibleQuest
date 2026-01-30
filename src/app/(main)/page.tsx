"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Target, Trophy, Flame, Scroll, MapPin, Heart, Cross } from "lucide-react";
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
  history: { bgColor: "bg-primary-100", iconColor: "text-primary-600" },
  context: { bgColor: "bg-olive-100", iconColor: "text-olive-600" },
  verses: { bgColor: "bg-info-100", iconColor: "text-info-600" },
  doctrines: { bgColor: "bg-gold-100", iconColor: "text-gold-700" },
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
        <h1 className="text-2xl font-bold text-primary-800 mb-2">
          {isGuest
            ? "Bienvenue sur BibleQuest!"
            : `Bonjour, ${username || "Utilisateur"}!`}
        </h1>
        <p className="text-primary-500">
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
              <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                <Flame className="w-4 h-4 text-gold-600" />
              </div>
              <span className="text-sm text-primary-500">Série</span>
            </div>
            <p className="text-2xl font-bold text-primary-800">{currentStreak} jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-error-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-error-500" />
              </div>
              <span className="text-sm text-primary-500">Vies</span>
            </div>
            <HeartsDisplay hearts={hearts} />
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-4">
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
      <h2 className="text-lg font-semibold text-primary-800 mb-4">
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
          const style = styleMap[category.name_key] || { bgColor: "bg-gray-100", iconColor: "text-gray-600" };
          const names = nameMap[category.name_key] || { name: category.name_key, description: "" };
          return (
            <Link key={category.id} href={`/apprendre?category=${category.name_key}`}>
              <Card variant="interactive" className="h-full">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl ${style.bgColor} flex items-center justify-center mb-3 shadow-soft`}>
                    <Icon className={`w-7 h-7 ${style.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-primary-800">{names.name}</h3>
                  <p className="text-xs text-primary-400 mt-1">
                    {category.lessonCount} leçons
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
            <h2 className="text-lg font-semibold text-primary-800">Classement</h2>
            <Link
              href="/classement"
              className="text-olive-600 hover:text-olive-700 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold-600" />
            </div>
            <p className="text-primary-600">
              Compétez avec d&apos;autres joueurs et grimpez dans le classement!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guest CTA */}
      {isGuest && (
        <Card className="mt-8 border-2 border-olive-300 bg-olive-50/50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-olive-600" />
            </div>
            <h2 className="text-lg font-semibold text-primary-800 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-primary-500 mb-4">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button size="lg">Créer un compte gratuit</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Daily Verse */}
      <Card className="mt-8 bg-parchment-100 border-parchment-400">
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
        </CardContent>
      </Card>
    </div>
  );
}
