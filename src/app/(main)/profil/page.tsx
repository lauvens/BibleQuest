"use client";

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

// Sample achievements
const achievements = [
  { id: "1", name: "Premier Pas", icon: "footprints", unlocked: true },
  { id: "2", name: "Semaine Fidèle", icon: "flame", unlocked: true },
  { id: "3", name: "Sans Faute", icon: "star", unlocked: false },
  { id: "4", name: "Érudit", icon: "graduation-cap", unlocked: false },
];

// Sample stats
const stats = [
  { label: "Leçons terminées", value: 12 },
  { label: "Questions répondues", value: 156 },
  { label: "Précision moyenne", value: "78%" },
  { label: "Temps total", value: "4h 32m" },
];

export default function ProfilPage() {
  const router = useRouter();
  const {
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
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mode Invité
            </h1>
            <p className="text-gray-600 mb-6">
              Créez un compte pour sauvegarder votre progression, débloquer des
              succès et apparaître dans le classement!
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {(username || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {username || "Utilisateur"}
                </h1>
                <p className="text-gray-500">{email}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Succès</h2>
        <Link
          href="/profil/succes"
          className="text-primary-600 hover:underline text-sm font-medium"
        >
          Voir tout
        </Link>
      </div>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center ${
                  achievement.unlocked ? "" : "opacity-40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.unlocked
                      ? "bg-yellow-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Trophy
                    className={`w-6 h-6 ${
                      achievement.unlocked
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600">{achievement.name}</p>
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
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
