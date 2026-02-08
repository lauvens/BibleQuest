"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/lib/store/user-store";
import { getUserAchievements } from "@/lib/supabase/queries";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  coin_reward: number;
  unlocked: boolean;
}

export default function SuccesPage() {
  const router = useRouter();
  const { id: userId, isGuest } = useUserStore();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAchievements = useCallback(async () => {
    if (!userId || isGuest) return;
    try {
      const data = await getUserAchievements(userId);
      // Unlocked first, then locked
      const sorted = [...data].sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return a.condition_value - b.condition_value;
      });
      setAchievements(sorted);
    } catch (err) {
      console.error("Error loading achievements:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest]);

  useEffect(() => {
    if (isGuest) {
      router.push("/connexion");
      return;
    }
    loadAchievements();
  }, [isGuest, router, loadAchievements]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/profil"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au profil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mes Succes</h1>
              <p className="text-white/80 text-sm">
                {unlockedCount}/{achievements.length} debloques
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-2">
        <div className="h-2 bg-white/30 dark:bg-primary-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-400 transition-all"
            style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Achievements grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-primary-500 dark:text-primary-400">
              Aucun succes disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`transition-all ${
                  achievement.unlocked
                    ? "border-gold-300 dark:border-gold-700 shadow-soft"
                    : "opacity-60"
                }`}
              >
                <CardContent className="p-4 text-center">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      achievement.unlocked
                        ? "bg-gold-100 dark:bg-gold-900/40"
                        : "bg-parchment-200 dark:bg-primary-800"
                    }`}
                  >
                    {achievement.unlocked ? (
                      <span className="text-2xl">{achievement.icon}</span>
                    ) : (
                      <Lock className="w-5 h-5 text-primary-400 dark:text-primary-500" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-sm text-primary-800 dark:text-parchment-50 mb-1">
                    {achievement.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-primary-500 dark:text-primary-400 mb-2 line-clamp-2">
                    {achievement.description}
                  </p>

                  {/* Reward */}
                  {achievement.coin_reward > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 font-medium">
                      +{achievement.coin_reward} pieces
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
