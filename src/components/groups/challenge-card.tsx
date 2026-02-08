"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle, Users, ChevronDown, ChevronUp, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getChallengeProgressDetails } from "@/lib/supabase/queries";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    book_name: string;
    chapter_start: number;
    verse_start: number;
    chapter_end: number | null;
    verse_end: number | null;
    deadline: string;
    reading_groups?: {
      id: string;
      name: string;
      cover_color: string;
    };
  };
  userProgress?: {
    completed: boolean;
    completed_at: string | null;
  };
  totalMembers?: number;
  completedCount?: number;
  onMarkComplete?: () => void;
  showGroupName?: boolean;
  isOwnerOrAdmin?: boolean;
  groupId?: string;
}

type ProgressDetail = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  completed: boolean;
  completed_at: string | null;
};

function formatTimeRemaining(deadline: string): { text: string; urgent: boolean; expired: boolean } {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "Termine", urgent: false, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days}j ${hours}h`, urgent: days <= 1, expired: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, urgent: hours <= 3, expired: false };
  }
  return { text: `${minutes}m`, urgent: true, expired: false };
}

function formatBibleReference(challenge: ChallengeCardProps["challenge"]): string {
  const { book_name, chapter_start, verse_start, chapter_end, verse_end } = challenge;

  if (chapter_end && chapter_end !== chapter_start) {
    return `${book_name} ${chapter_start}${verse_start > 1 ? `:${verse_start}` : ""} - ${chapter_end}${verse_end ? `:${verse_end}` : ""}`;
  }

  if (verse_end && verse_end !== verse_start) {
    return `${book_name} ${chapter_start}:${verse_start}-${verse_end}`;
  }

  if (verse_start > 1) {
    return `${book_name} ${chapter_start}:${verse_start}`;
  }

  return `${book_name} ${chapter_start}`;
}

function formatCompletedDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) +
    " a " +
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function ChallengeCard({
  challenge,
  userProgress,
  totalMembers,
  completedCount,
  onMarkComplete,
  showGroupName = false,
  isOwnerOrAdmin = false,
  groupId,
}: ChallengeCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(challenge.deadline));
  const [showProgress, setShowProgress] = useState(false);
  const [progressDetails, setProgressDetails] = useState<ProgressDetail[] | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const isCompleted = userProgress?.completed || false;

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(challenge.deadline));
    }, 60000);
    return () => clearInterval(interval);
  }, [challenge.deadline]);

  async function handleToggleProgress() {
    const next = !showProgress;
    setShowProgress(next);

    if (next && !progressDetails && groupId) {
      setLoadingProgress(true);
      try {
        const details = await getChallengeProgressDetails(challenge.id, groupId);
        setProgressDetails(details);
      } catch (err) {
        console.error("Error loading progress:", err);
      } finally {
        setLoadingProgress(false);
      }
    }
  }

  const bibleRef = formatBibleReference(challenge);

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden border transition-all",
        isCompleted
          ? "border-success-300 dark:border-success-700"
          : timeRemaining.urgent
          ? "border-error-300 dark:border-error-700"
          : "border-parchment-200 dark:border-primary-700"
      )}
    >
      {/* Group color bar */}
      {showGroupName && challenge.reading_groups && (
        <div
          className="h-2"
          style={{ backgroundColor: challenge.reading_groups.cover_color }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {showGroupName && challenge.reading_groups && (
              <p className="text-xs text-primary-500 dark:text-primary-400 mb-1">
                {challenge.reading_groups.name}
              </p>
            )}
            <h3 className="font-semibold text-primary-800 dark:text-parchment-50">
              {challenge.title}
            </h3>
          </div>

          {/* Status/Countdown badge */}
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Termine
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                timeRemaining.expired
                  ? "bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400"
                  : timeRemaining.urgent
                  ? "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400 animate-pulse"
                  : "bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              {timeRemaining.text}
            </div>
          )}
        </div>

        {/* Bible reference */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <BookOpen className="w-4 h-4 text-primary-400" />
          <span className="text-primary-700 dark:text-primary-300 font-medium">
            {bibleRef}
          </span>
        </div>

        {/* Description */}
        {challenge.description && (
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-2 line-clamp-2">
            {challenge.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-parchment-100 dark:border-primary-700">
          {/* Progress indicator */}
          {totalMembers !== undefined && completedCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-primary-500 dark:text-primary-400">
              <Users className="w-4 h-4" />
              <span>
                {completedCount}/{totalMembers} ont termine
              </span>
              <div className="w-16 h-1.5 bg-parchment-200 dark:bg-primary-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-500 transition-all"
                  style={{ width: `${totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Mark complete button */}
          {!isCompleted && onMarkComplete && !timeRemaining.expired && (
            <button
              onClick={onMarkComplete}
              className="ml-auto px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Marquer comme lu
            </button>
          )}
        </div>

        {/* Progress details for owner/admin */}
        {isOwnerOrAdmin && groupId && (
          <div className="mt-3">
            <button
              onClick={handleToggleProgress}
              className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {showProgress ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Voir la progression
            </button>

            {showProgress && (
              <div className="mt-2 space-y-2">
                {loadingProgress ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : progressDetails && progressDetails.length > 0 ? (
                  progressDetails.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                    >
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-700/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt=""
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-primary-400 dark:text-primary-500" />
                        )}
                      </div>

                      {/* Name */}
                      <span className="flex-1 text-xs text-primary-700 dark:text-primary-300 truncate">
                        {member.username}
                      </span>

                      {/* Status */}
                      {member.completed ? (
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                          <span className="text-success-600 dark:text-success-400">
                            {formatCompletedDate(member.completed_at!)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-primary-400 dark:text-primary-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>En attente</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-primary-400 dark:text-primary-500 py-2">
                    Aucune donnee de progression
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
