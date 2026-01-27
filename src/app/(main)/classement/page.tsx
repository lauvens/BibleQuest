"use client";

import { useState } from "react";
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";

// Sample leaderboard data
const leaderboardData = [
  { rank: 1, username: "BiblioPhile", xp: 2450, change: "up", avatar: "B" },
  { rank: 2, username: "FaithSeeker", xp: 2280, change: "up", avatar: "F" },
  { rank: 3, username: "ScriptureStudent", xp: 2150, change: "down", avatar: "S" },
  { rank: 4, username: "WordLover", xp: 1980, change: "same", avatar: "W" },
  { rank: 5, username: "GraceWalker", xp: 1850, change: "up", avatar: "G" },
  { rank: 6, username: "TruthHunter", xp: 1720, change: "down", avatar: "T" },
  { rank: 7, username: "SpiritGuided", xp: 1650, change: "same", avatar: "S" },
  { rank: 8, username: "PsalmSinger", xp: 1580, change: "up", avatar: "P" },
  { rank: 9, username: "ProverbsReader", xp: 1490, change: "down", avatar: "P" },
  { rank: 10, username: "GospelBearer", xp: 1420, change: "same", avatar: "G" },
];

type TimeRange = "weekly" | "monthly" | "allTime";

export default function ClassementPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const { username, xp, isGuest } = useUserStore();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">{rank}</span>;
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Calculate user's hypothetical rank
  const userRank = leaderboardData.findIndex((p) => p.xp < xp) + 1 || leaderboardData.length + 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-900">Classement</h1>
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
                "bg-primary-600 text-white": timeRange === tab.value,
                "bg-gray-100 text-gray-600 hover:bg-gray-200":
                  timeRange !== tab.value,
              }
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {/* 2nd place */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2 text-xl font-bold text-gray-600">
            {leaderboardData[1].avatar}
          </div>
          <p className="font-medium text-sm">{leaderboardData[1].username}</p>
          <p className="text-xs text-gray-500">{leaderboardData[1].xp} XP</p>
          <div className="w-16 h-20 bg-gray-200 rounded-t-lg mt-2 flex items-center justify-center">
            <Medal className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        {/* 1st place */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-yellow-600 ring-4 ring-yellow-400">
            {leaderboardData[0].avatar}
          </div>
          <p className="font-medium">{leaderboardData[0].username}</p>
          <p className="text-sm text-gray-500">{leaderboardData[0].xp} XP</p>
          <div className="w-20 h-28 bg-yellow-100 rounded-t-lg mt-2 flex items-center justify-center">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        {/* 3rd place */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-xl font-bold text-amber-600">
            {leaderboardData[2].avatar}
          </div>
          <p className="font-medium text-sm">{leaderboardData[2].username}</p>
          <p className="text-xs text-gray-500">{leaderboardData[2].xp} XP</p>
          <div className="w-16 h-16 bg-amber-100 rounded-t-lg mt-2 flex items-center justify-center">
            <Medal className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Full leaderboard */}
      <Card>
        <CardContent className="p-0">
          {leaderboardData.slice(3).map((player, index) => (
            <div
              key={player.rank}
              className={cn(
                "flex items-center gap-4 p-4",
                {
                  "border-b border-gray-100": index < leaderboardData.length - 4,
                }
              )}
            >
              {getRankIcon(player.rank)}
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-medium text-primary-600">
                {player.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{player.username}</p>
                <p className="text-sm text-gray-500">{player.xp} XP</p>
              </div>
              {getChangeIcon(player.change)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User's position */}
      {!isGuest && (
        <Card className="mt-6 border-2 border-primary-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Votre position</p>
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 flex items-center justify-center font-bold text-primary-600">
                #{userRank}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-medium text-primary-600">
                {(username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{username || "Vous"}</p>
                <p className="text-sm text-gray-500">{xp} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGuest && (
        <Card className="mt-6 border-2 border-primary-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">
              Créez un compte pour apparaître dans le classement!
            </p>
            <a
              href="/inscription"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              S&apos;inscrire
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
