"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/game/xp-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { useUserStore } from "@/lib/store/user-store";

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isGuest
            ? "Bienvenue sur BibleQuest!"
            : `Bonjour, ${username || "Utilisateur"}!`}
        </h1>
        <p className="text-gray-600">
          {isGuest
            ? "Commencez votre voyage biblique dès maintenant"
            : "Continuez votre apprentissage"}
        </p>
      </div>

      {/* Stats Grid - Mobile */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Série</span>
            </div>
            <p className="text-2xl font-bold">{currentStreak} jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Coeurs</span>
            </div>
            <HeartsDisplay hearts={hearts} />
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
      <Card className="mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Défi Quotidien</h2>
              <p className="text-white/90">
                10 questions mixtes pour tester vos connaissances
              </p>
            </div>
            <Link href="/defi">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                <Target className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Que voulez-vous apprendre?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/apprendre?category=history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-900">Histoire</h3>
              <p className="text-xs text-gray-500 mt-1">
                Chronologie biblique
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=context">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Contexte</h3>
              <p className="text-xs text-gray-500 mt-1">Culture et géographie</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=verses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Versets</h3>
              <p className="text-xs text-gray-500 mt-1">Mémorisation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=doctrines">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Doctrines</h3>
              <p className="text-xs text-gray-500 mt-1">Fondements de la foi</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Leaderboard Preview */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Classement</h2>
            <Link
              href="/classement"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-gold-500" />
            <p className="text-gray-600">
              Competez avec d&apos;autres joueurs et grimpez dans le classement!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guest CTA */}
      {isGuest && (
        <Card className="mt-8 border-2 border-primary-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-gray-600 mb-4">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button>Créer un compte gratuit</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
