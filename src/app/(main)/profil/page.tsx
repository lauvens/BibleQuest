"use client";

// Disable static pre-rendering - this page requires client-side auth
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  Trophy,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/game/xp-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { useUserStore } from "@/lib/store/user-store";
import { createClient } from "@/lib/supabase/client";
import { getUserStats, getUserAchievements } from "@/lib/supabase/queries";

interface AchievementData {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

interface StatsData {
  lessonsCompleted: number;
  totalAttempts: number;
  avgScore: number;
}

// Hoisted outside component to avoid recreation - rendering-hoist-jsx rule
const FALLBACK_ACHIEVEMENTS: AchievementData[] = [
  { id: "1", name: "Premier Pas", icon: "footprints", unlocked: false },
  { id: "2", name: "Semaine Fidèle", icon: "flame", unlocked: false },
  { id: "3", name: "Sans Faute", icon: "star", unlocked: false },
  { id: "4", name: "Érudit", icon: "graduation-cap", unlocked: false },
];

export default function ProfilPage() {
  const router = useRouter();
  const {
    id: userId,
    isGuest,
    username,
    email,
    xp,
    level,
    coins,
    gems,
    currentStreak,
    longestStreak,
    getActualHearts,
    clearUser,
  } = useUserStore();

  const hearts = getActualHearts();
  const supabase = createClient();

  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  const loadProfile = async () => {
    if (!userId || isGuest) return;
    setError(false);
    try {
      // Parallel fetch - async-parallel rule
      const [statsData, achievementsData] = await Promise.all([
        getUserStats(userId),
        getUserAchievements(userId),
      ]);
      setStats(statsData);
      setAchievements(
        achievementsData.map((a) => ({
          id: a.id,
          name: a.name,
          icon: a.icon,
          unlocked: a.unlocked,
        }))
      );
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId, isGuest]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore signOut errors
    }
    clearUser();
    router.push("/connexion");
    router.refresh();
  };

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-parchment-200 dark:bg-primary-800 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary-400 dark:text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
              Mode Invite
            </h1>
            <p className="text-primary-600 dark:text-primary-400 mb-6">
              Creez un compte pour sauvegarder votre progression, debloquer des
              succes et apparaitre dans le classement!
            </p>
            <div className="space-y-3">
              <Link href="/inscription">
                <Button className="w-full">Créer un compte</Button>
              </Link>
              <Link href="/connexion">
                <Button variant="outline" className="w-full">
                  Se connecter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Guest stats preview */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
              Votre session
            </h2>
            <XpBar xp={xp} level={level} className="mb-4" />
            <div className="flex items-center justify-between">
              <CurrencyDisplay coins={coins} gems={gems} />
              <StreakBadge streak={currentStreak} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-error-600 mb-2">Impossible de charger le profil.</p>
            <button onClick={loadProfile} className="text-sm font-medium text-primary-600 hover:underline">
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayStats = [
    { label: "Leçons terminées", value: stats?.lessonsCompleted ?? 0 },
    { label: "Questions répondues", value: stats?.totalAttempts ?? 0 },
    { label: "Précision moyenne", value: stats ? `${stats.avgScore}%` : "—" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                  {(username || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
                  {username || "Utilisateur"}
                </h1>
                <p className="text-primary-500 dark:text-primary-400">{email}</p>
              </div>
            </div>
            <Link href="/profil/parametres" className="p-2 hover:bg-parchment-200 dark:hover:bg-primary-800/50 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-primary-500 dark:text-primary-400" />
            </Link>
          </div>

          <XpBar xp={xp} level={level} className="mb-4" />

          <div className="flex items-center justify-between">
            <HeartsDisplay hearts={hearts} />
            <CurrencyDisplay coins={coins} gems={gems} />
          </div>
        </CardContent>
      </Card>

      {/* Streak card */}
      <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-6 h-6" />
                <span className="text-2xl font-bold">{currentStreak} jours</span>
              </div>
              <p className="text-white/80">Série actuelle</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{longestStreak}</p>
              <p className="text-white/80">Meilleure série</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">Statistiques</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {displayStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{stat.value}</p>
              <p className="text-sm text-primary-500 dark:text-primary-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50">Succes</h2>
        <Link
          href="/profil/succes"
          className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
        >
          Voir tout
        </Link>
      </div>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {(achievements.length > 0
              ? achievements.slice(0, 4)
              : FALLBACK_ACHIEVEMENTS
            ).map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center ${
                  achievement.unlocked ? "" : "opacity-40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.unlocked
                      ? "bg-gold-100 dark:bg-gold-900/40"
                      : "bg-parchment-200 dark:bg-primary-800"
                  }`}
                >
                  <Trophy
                    className={`w-6 h-6 ${
                      achievement.unlocked
                        ? "text-gold-500 dark:text-gold-400"
                        : "text-primary-400 dark:text-primary-600"
                    }`}
                  />
                </div>
                <p className="text-xs text-primary-600 dark:text-primary-400">{achievement.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="space-y-3">
        <Link href="/boutique">
          <Button variant="outline" className="w-full justify-start">
            <ShoppingBag className="w-5 h-5 mr-3" />
            Boutique
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Se deconnecter
        </Button>
      </div>
    </div>
  );
}
