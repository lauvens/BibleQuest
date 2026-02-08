"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, Trophy, Gift, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/lib/store/user-store";
import { getUserAchievements, claimAchievementReward } from "@/lib/supabase/queries";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  coin_reward: number;
  unlocked: boolean;
  claimed: boolean;
}

export default function SuccesPage() {
  const router = useRouter();
  const { id: userId, isGuest, addCoins } = useUserStore();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!userId || isGuest) return;
    try {
      const data = await getUserAchievements(userId);
      // Unlocked+unclaimed first, then unlocked+claimed, then locked
      const sorted = [...data].sort((a, b) => {
        if (a.unlocked && !a.claimed && !(b.unlocked && !b.claimed)) return -1;
        if (!(a.unlocked && !a.claimed) && b.unlocked && !b.claimed) return 1;
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

  async function handleClaim(achievement: Achievement) {
    if (!userId || claiming) return;
    setClaiming(achievement.id);
    try {
      await claimAchievementReward(userId, achievement.id, achievement.coin_reward);
      // Update local state
      addCoins(achievement.coin_reward);
      setAchievements((prev) =>
        prev.map((a) => (a.id === achievement.id ? { ...a, claimed: true } : a))
      );
    } catch (err) {
      console.error("Error claiming achievement:", err);
    } finally {
      setClaiming(null);
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const unclaimedCount = achievements.filter((a) => a.unlocked && !a.claimed).length;

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
                {unclaimedCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-white text-xs font-medium">
                    {unclaimedCount} a reclamer
                  </span>
                )}
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
            {achievements.map((achievement) => {
              const canClaim = achievement.unlocked && !achievement.claimed && achievement.coin_reward > 0;
              const isClaiming = claiming === achievement.id;

              return (
                <Card
                  key={achievement.id}
                  className={`transition-all ${
                    canClaim
                      ? "border-gold-400 dark:border-gold-600 shadow-elevated ring-2 ring-gold-300/50 dark:ring-gold-600/30"
                      : achievement.unlocked
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
                    <p className="text-xs text-primary-500 dark:text-primary-400 mb-3 line-clamp-2">
                      {achievement.description}
                    </p>

                    {/* Reward & Claim */}
                    {achievement.coin_reward > 0 && (
                      <>
                        {canClaim ? (
                          <button
                            onClick={() => handleClaim(achievement)}
                            disabled={isClaiming}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gold-400 hover:bg-gold-500 disabled:bg-gold-300 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            {isClaiming ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Gift className="w-3.5 h-3.5" />
                            )}
                            Reclamer +{achievement.coin_reward} pieces
                          </button>
                        ) : achievement.unlocked && achievement.claimed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-success-600 dark:text-success-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Reclame
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-primary-400 dark:text-primary-500 font-medium">
                            +{achievement.coin_reward} pieces
                          </span>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
