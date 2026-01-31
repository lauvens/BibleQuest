"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, X, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { useUserStore } from "@/lib/store/user-store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { QuestionType, QuestionContent } from "@/types";
import { getLesson, getQuestions, saveProgress, updateUserStats } from "@/lib/supabase/queries";
import {
  checkAndUnlockAchievements,
  getUserLessonsCompleted,
} from "@/lib/services/achievements";

interface LoadedQuestion {
  type: QuestionType;
  content: QuestionContent;
}

export default function LeconPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const {
    id: userId,
    getActualHearts,
    loseHeart,
    addXp,
    addCoins,
    updateStreak,
    isGuest,
    updateGuestProgress,
    currentStreak,
    level,
    heartsUpdatedAt,
  } = useUserStore();

  const { showAchievementToast } = useToast();

  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [lessonData, setLessonData] = useState<{ name: string; xp_reward: number; coin_reward: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hearts = getActualHearts();

  const loadLesson = () => {
    setLoading(true);
    setError(false);
    Promise.all([getLesson(lessonId), getQuestions(lessonId)])
      .then(([lesson, qs]) => {
        setLessonData({
          name: lesson.name,
          xp_reward: lesson.xp_reward,
          coin_reward: lesson.coin_reward,
        });
        setQuestions(
          qs.map((q) => ({
            type: q.type as QuestionType,
            content: q.content as unknown as QuestionContent,
          }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  if (error) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600 dark:text-error-400 mb-2">Impossible de charger la leçon.</p>
          <button onClick={loadLesson} className="text-sm font-medium text-primary-600 dark:text-primary-300 hover:underline">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading || !lessonData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <p className="text-primary-400 dark:text-primary-400">{loading ? "Chargement..." : "Aucune question trouvée."}</p>
      </div>
    );
  }

  const progress = (currentQuestionIndex / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      const hasHearts = loseHeart();
      if (!hasHearts && getActualHearts() <= 0) {
        setIsComplete(true);
        return;
      }
    }

    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        const score = Math.round(
          ((correctAnswers + (correct ? 1 : 0)) / questions.length) * 100
        );
        const passed = score >= 70;
        const isPerfect = score === 100;

        const xpEarned = Math.round(lessonData.xp_reward * (score / 100));
        const coinsEarned = Math.round(lessonData.coin_reward * (score / 100));

        addXp(xpEarned);
        addCoins(coinsEarned);

        if (isGuest) {
          updateGuestProgress(lessonId, score, passed);
        } else if (userId) {
          // Save to Supabase in background
          saveProgress(userId, lessonId, score, passed).catch(console.error);
          updateUserStats(userId, xpEarned, coinsEarned).catch(console.error);

          // Check for achievement unlocks
          if (passed) {
            try {
              const lessonsCompleted = await getUserLessonsCompleted(userId);
              const unlocked = await checkAndUnlockAchievements({
                userId,
                lessonsCompleted: lessonsCompleted + 1,
                streak: currentStreak,
                level,
                isPerfectLesson: isPerfect,
              });

              // Show toast for each unlocked achievement
              unlocked.forEach((achievement) => {
                showAchievementToast({
                  name: achievement.name,
                  icon: achievement.icon,
                });
                // Also add the coin reward to user
                addCoins(achievement.coin_reward);
              });
            } catch (err) {
              console.error("Failed to check achievements:", err);
            }
          }
        }

        setIsComplete(true);
      }
    }, 1500);
  };

  const finalScore = Math.round((correctAnswers / questions.length) * 100);
  const passed = finalScore >= 70;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {hearts <= 0 ? (
              <>
                <div className="w-20 h-20 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-error-500" />
                </div>
                <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-100 mb-2">
                  Plus de cœurs!
                </h1>
                <p className="text-primary-600 dark:text-primary-300 mb-6">
                  Attendez que vos cœurs se régénèrent ou achetez-en dans la boutique.
                </p>
              </>
            ) : passed ? (
              <>
                <div className="w-20 h-20 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-gold-500" />
                </div>
                <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-100 mb-2">
                  Félicitations!
                </h1>
                <p className="text-primary-600 dark:text-primary-300 mb-4">
                  Vous avez terminé la leçon avec {finalScore}%
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-xp">
                      +{Math.round(lessonData.xp_reward * (finalScore / 100))}
                    </p>
                    <p className="text-sm text-primary-400 dark:text-primary-400">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-500">
                      +{Math.round(lessonData.coin_reward * (finalScore / 100))}
                    </p>
                    <p className="text-sm text-primary-400 dark:text-primary-400">Pièces</p>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={cn("w-8 h-8", {
                        "fill-gold-400 text-gold-400":
                          (star === 1 && finalScore >= 50) ||
                          (star === 2 && finalScore >= 80) ||
                          (star === 3 && finalScore === 100),
                        "text-parchment-300 dark:text-primary-600":
                          (star === 1 && finalScore < 50) ||
                          (star === 2 && finalScore < 80) ||
                          (star === 3 && finalScore < 100),
                      })}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-parchment-200 dark:bg-primary-850 flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-100 mb-2">
                  Pas tout à fait...
                </h1>
                <p className="text-primary-600 dark:text-primary-300 mb-6">
                  Vous avez obtenu {finalScore}%. Il faut au moins 70% pour valider.
                </p>
              </>
            )}

            <div className="space-y-3">
              <Link href="/apprendre">
                <Button className="w-full">Continuer</Button>
              </Link>
              {!passed && hearts > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setCorrectAnswers(0);
                    setIsComplete(false);
                  }}
                >
                  Réessayer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-parchment-50/95 dark:bg-primary-900/95 backdrop-blur-sm border-b border-parchment-300 dark:border-primary-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 hover:bg-parchment-200 dark:hover:bg-primary-800 rounded-lg"
          >
            <X className="w-6 h-6 text-primary-400" />
          </button>

          <div className="flex-1">
            <ProgressBar value={progress} max={100} />
          </div>

          <HeartsDisplay
            hearts={hearts}
            heartsUpdatedAt={heartsUpdatedAt}
            showTimer
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <QuestionRenderer
              type={currentQuestion.type}
              content={currentQuestion.content}
              onAnswer={handleAnswer}
              disabled={hearts <= 0}
            />
          </CardContent>
        </Card>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-100 mb-2">
                Quitter la leçon?
              </h2>
              <p className="text-primary-600 dark:text-primary-300 mb-6">
                Votre progression ne sera pas sauvegardée.
              </p>
              <div className="space-y-3">
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => router.push("/apprendre")}
                >
                  Quitter
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Continuer la leçon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
