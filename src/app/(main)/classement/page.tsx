"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";
import { getLeaderboard } from "@/lib/supabase/queries";

interface LeaderboardEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  xp: number;
}

type TimeRange = "weekly" | "monthly" | "allTime";

export default function ClassementPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const { id: userId, username, xp, isGuest } = useUserStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getLeaderboard(20, timeRange)
      .then((data) => setLeaderboard(data as LeaderboardEntry[]))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const loadLeaderboard = () => {
    setLoading(true);
    setError(false);
    getLeaderboard(20, timeRange)
      .then((data) => setLeaderboard(data as LeaderboardEntry[]))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-gold-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-primary-400 dark:text-primary-500" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600 dark:text-amber-500" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">{rank}</span>;
    }
  };

  const userRank = leaderboard.findIndex((p) => p.id === userId) + 1;
  const userRankFallback = userRank > 0 ? userRank : (leaderboard.findIndex((p) => p.xp < xp) + 1 || leaderboard.length + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-gold-500 dark:text-gold-400" />
        <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">Classement</h1>
      </div>

      {/* Time range tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "weekly", label: "Cette semaine" },
          { value: "monthly", label: "Ce mois" },
          { value: "allTime", label: "Tout temps" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTimeRange(tab.value as TimeRange)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              {
                "bg-primary-600 text-white dark:bg-primary-500": timeRange === tab.value,
                "bg-parchment-200 dark:bg-primary-800 text-primary-600 dark:text-primary-300 hover:bg-parchment-300 dark:hover:bg-primary-700":
                  timeRange !== tab.value,
              }
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-error-600 mb-2">Impossible de charger le classement.</p>
            <button onClick={loadLeaderboard} className="text-sm font-medium text-primary-600 hover:underline">
              Réessayer
            </button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="text-center py-12 text-primary-500 dark:text-primary-400">Chargement...</div>
      ) : leaderboard.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
            <p className="text-primary-600 dark:text-primary-400">Aucun joueur dans le classement pour le moment.</p>
            <p className="text-primary-500 dark:text-primary-500 text-sm mt-2">Completez des lecons pour apparaitre ici!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd place */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-parchment-200 dark:bg-primary-700 flex items-center justify-center mx-auto mb-2 text-xl font-bold text-primary-600 dark:text-primary-300">
                  {(leaderboard[1].username || "?").charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-sm text-primary-800 dark:text-parchment-50">{leaderboard[1].username || "Anonyme"}</p>
                <p className="text-xs text-primary-500 dark:text-primary-400">{leaderboard[1].xp} XP</p>
                <div className="w-16 h-20 bg-parchment-200 dark:bg-primary-700 rounded-t-lg mt-2 flex items-center justify-center">
                  <Medal className="w-8 h-8 text-primary-400 dark:text-primary-500" />
                </div>
              </div>

              {/* 1st place */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-gold-600 dark:text-gold-400 ring-4 ring-gold-400 dark:ring-gold-600">
                  {(leaderboard[0].username || "?").charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-primary-800 dark:text-parchment-50">{leaderboard[0].username || "Anonyme"}</p>
                <p className="text-sm text-primary-500 dark:text-primary-400">{leaderboard[0].xp} XP</p>
                <div className="w-20 h-28 bg-gold-100 dark:bg-gold-900/40 rounded-t-lg mt-2 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-gold-500 dark:text-gold-400" />
                </div>
              </div>

              {/* 3rd place */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-2 text-xl font-bold text-amber-600 dark:text-amber-400">
                  {(leaderboard[2].username || "?").charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-sm text-primary-800 dark:text-parchment-50">{leaderboard[2].username || "Anonyme"}</p>
                <p className="text-xs text-primary-500 dark:text-primary-400">{leaderboard[2].xp} XP</p>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-t-lg mt-2 flex items-center justify-center">
                  <Medal className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          )}

          {/* Full leaderboard */}
          {leaderboard.length > 3 && (
            <Card>
              <CardContent className="p-0">
                {leaderboard.slice(3).map((player, index) => (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center gap-4 p-4",
                      {
                        "border-b border-parchment-200 dark:border-primary-700": index < leaderboard.length - 4,
                        "bg-primary-50 dark:bg-primary-900/30": player.id === userId,
                      }
                    )}
                  >
                    {getRankIcon(index + 4)}
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center font-medium text-primary-600 dark:text-primary-300">
                      {(player.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-800 dark:text-parchment-50">{player.username || "Anonyme"}</p>
                      <p className="text-sm text-primary-500 dark:text-primary-400">{player.xp} XP</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* User's position */}
      {!isGuest && (
        <Card className="mt-6 border-2 border-primary-200 dark:border-primary-700">
          <CardContent className="p-4">
            <p className="text-sm text-primary-500 dark:text-primary-400 mb-2">Votre position</p>
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 flex items-center justify-center font-bold text-primary-600 dark:text-primary-300">
                #{userRankFallback}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center font-medium text-primary-600 dark:text-primary-300">
                {(username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary-800 dark:text-parchment-50">{username || "Vous"}</p>
                <p className="text-sm text-primary-500 dark:text-primary-400">{xp} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGuest && (
        <Card className="mt-6 border-2 border-primary-200 dark:border-primary-700">
          <CardContent className="p-6 text-center">
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              Creez un compte pour apparaitre dans le classement!
            </p>
            <a
              href="/inscription"
              className="inline-block bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-400 transition-colors"
            >
              S&apos;inscrire
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
