"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, X, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { QuizProvider, useQuiz } from "@/lib/contexts/quiz-context";
import { CelebrationModal } from "@/components/ui/celebration-modal";
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

function LeconContent() {
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
  const { totalPoints, maxCombo, correctAnswers: quizCorrectAnswers, resetQuiz } = useQuiz();

  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [lessonData, setLessonData] = useState<{ name: string; xp_reward: number; coin_reward: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState({ xp: 0, coins: 0 });

  const hearts = getActualHearts();

  const loadLesson = useCallback(() => {
    setLoading(true);
    setError(false);
    resetQuiz();
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
  }, [lessonId, resetQuiz]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

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

  const handleQuestionComplete = async (correct: boolean) => {
    if (!correct) {
      const hasHearts = loseHeart();
      if (!hasHearts && getActualHearts() <= 0) {
        setIsComplete(true);
        return;
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Use quizCorrectAnswers + 1 if this answer was correct (since state updates are async)
      const finalCorrect = quizCorrectAnswers + (correct ? 1 : 0);
      const score = Math.round((finalCorrect / questions.length) * 100);
      const passed = score >= 70;
      const isPerfect = score === 100;

      // Calculate rewards with combo bonus
      const baseXp = lessonData!.xp_reward;
      const baseCoins = lessonData!.coin_reward;
      const comboBonus = Math.min(maxCombo * 2, 20);

      const xpEarned = Math.round(baseXp * (score / 100)) + comboBonus + Math.round(totalPoints / 10);
      const coinsEarned = Math.round(baseCoins * (score / 100)) + Math.round(totalPoints / 20);

      addXp(xpEarned);
      addCoins(coinsEarned);
      setEarnedRewards({ xp: xpEarned, coins: coinsEarned });

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

      setShowCelebration(true);
      setIsComplete(true);
    }
  };

  const finalScore = questions.length > 0 ? Math.round((quizCorrectAnswers / questions.length) * 100) : 0;
  const passed = finalScore >= 70;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center p-4">
        <CelebrationModal
          isOpen={showCelebration && passed}
          onClose={() => setShowCelebration(false)}
          type="course-complete"
          title="Leçon terminée!"
          description={`${finalScore}% correct • ${totalPoints} points • Combo max: ${maxCombo}`}
          reward={{ xp: earnedRewards.xp, coins: earnedRewards.coins }}
        />

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
                <p className="text-primary-600 dark:text-primary-300 mb-2">
                  {finalScore}% de bonnes réponses
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                    <p className="text-2xl font-bold text-accent-500">{totalPoints}</p>
                    <p className="text-xs text-primary-400">Points</p>
                  </div>
                  <div className="p-3 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                    <p className="text-2xl font-bold text-gold-500">{maxCombo}</p>
                    <p className="text-xs text-primary-400">Combo max</p>
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">+{earnedRewards.xp}</p>
                    <p className="text-sm text-primary-400">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-500">+{earnedRewards.coins}</p>
                    <p className="text-sm text-primary-400">Pièces</p>
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
                    resetQuiz();
                    setIsComplete(false);
                    setShowCelebration(false);
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
            {currentQuestion && (
              <QuizQuestion
                key={currentQuestionIndex}
                type={currentQuestion.type}
                content={currentQuestion.content}
                onComplete={handleQuestionComplete}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
            )}
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

export default function LeconPage() {
  return (
    <QuizProvider>
      <LeconContent />
    </QuizProvider>
  );
}
