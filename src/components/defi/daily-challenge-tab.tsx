"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Trophy, Clock, Zap, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { CelebrationModal } from "@/components/ui/celebration-modal";
import { QuizProvider, useQuiz } from "@/lib/contexts/quiz-context";
import { useUserStore } from "@/lib/store/user-store";
import { QuestionType, QuestionContent } from "@/types";
import { getRandomQuestions, updateHearts, updateUserStats } from "@/lib/supabase/queries";

interface LoadedQuestion {
  type: QuestionType;
  content: QuestionContent;
}

function getDailyChallengeKey() {
  return `daily_challenge_${new Date().toISOString().split("T")[0]}`;
}

function DailyChallengeContent() {
  const router = useRouter();
  const { id: userId, isGuest, getActualHearts, loseHeart, addXp, addCoins, updateStreak } = useUserStore();
  const { totalPoints, maxCombo, correctAnswers, resetQuiz } = useQuiz();

  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState({ xp: 0, coins: 0 });
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const hearts = getActualHearts();

  // Check if daily challenge already completed today
  useEffect(() => {
    try {
      const key = getDailyChallengeKey();
      const done = localStorage.getItem(key);
      if (done) setAlreadyCompleted(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const loadQuestions = () => {
    setLoading(true);
    setError(false);
    getRandomQuestions(10)
      .then((qs) =>
        setQuestions(
          qs.map((q) => ({
            type: q.type as QuestionType,
            content: q.content as unknown as QuestionContent,
          }))
        )
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  const handleStart = () => {
    updateStreak();
    resetQuiz();
    setStarted(true);
  };

  const handleQuestionComplete = (correct: boolean) => {
    if (!correct) {
      loseHeart();
      if (userId && !isGuest) {
        updateHearts(userId, getActualHearts()).catch(console.error);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate final rewards with bonus for combo
      const baseXp = 25;
      const baseCoins = 15;
      const comboBonus = Math.min(maxCombo * 2, 20); // Up to 20 bonus

      const xpEarned = baseXp + Math.round(totalPoints / 5) + comboBonus;
      const coinsEarned = baseCoins + Math.round(totalPoints / 10);

      addXp(xpEarned);
      addCoins(coinsEarned);

      // Save rewards to database
      if (userId && !isGuest) {
        updateUserStats(userId, xpEarned, coinsEarned).catch((err) => {
          console.error("Failed to save challenge stats:", err);
          addXp(-xpEarned);
          addCoins(-coinsEarned);
        });
      }

      // Mark daily challenge as completed
      try {
        localStorage.setItem(getDailyChallengeKey(), "true");
      } catch {
        // localStorage unavailable
      }

      setEarnedRewards({ xp: xpEarned, coins: coinsEarned });
      setShowCelebration(true);
      setIsComplete(true);
    }
  };

  const finalScore = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-error-600 dark:text-error-400 mb-2">Impossible de charger le defi.</p>
        <button
          onClick={loadQuestions}
          className="text-sm font-medium text-primary-600 dark:text-primary-300 hover:underline"
        >
          Reessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-primary-400 dark:text-primary-400">
        Chargement du defi...
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white text-center">
            <Target className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Defi Quotidien</h2>
            <p className="text-white/90">
              {alreadyCompleted
                ? "Vous avez deja complete le defi d'aujourd'hui!"
                : `${questions.length} questions pour tester vos connaissances`}
            </p>
          </div>

          <CardContent className="p-6">
            {alreadyCompleted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-accent-500" />
                </div>
                <p className="text-primary-600 dark:text-primary-300 mb-2 font-medium">
                  Defi complete!
                </p>
                <p className="text-sm text-primary-400 dark:text-primary-500">
                  Revenez demain pour un nouveau defi.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                    <Clock className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Bonus temps</p>
                    <p className="text-xs text-primary-400">&lt;5s = +5 pts</p>
                  </div>
                  <div className="text-center p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                    <Flame className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Combo</p>
                    <p className="text-xs text-primary-400">Jusqu&apos;a x3</p>
                  </div>
                  <div className="text-center p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                    <Zap className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Points</p>
                    <p className="text-xs text-primary-400">+ XP & Pieces</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
                  <span className="text-primary-600 dark:text-primary-300 font-medium">Vos coeurs:</span>
                  <HeartsDisplay hearts={hearts} />
                </div>

                <Button
                  onClick={handleStart}
                  disabled={hearts <= 0 || questions.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {hearts <= 0 ? "Pas assez de coeurs" : "Commencer le defi"}
                </Button>

                {hearts <= 0 && (
                  <p className="text-center text-sm text-primary-400 dark:text-primary-400 mt-4">
                    Vos coeurs se regenerent toutes les 30 minutes
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-center p-4">
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          type="achievement"
          title="Defi termine!"
          description={`${finalScore}% correct - ${totalPoints} points - Combo max: ${maxCombo}`}
          reward={{ xp: earnedRewards.xp, coins: earnedRewards.coins }}
        />

        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gold-500" />
            </div>
            <h2 className="text-2xl font-bold text-primary-800 dark:text-parchment-100 mb-2">
              Defi termine!
            </h2>
            <p className="text-primary-600 dark:text-primary-300 mb-2">
              {finalScore}% de bonnes reponses
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
                <p className="text-sm text-primary-400">Pieces</p>
              </div>
            </div>

            <Button onClick={() => router.push("/")} className="w-full">
              Retour a l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-parchment-50/95 dark:bg-primary-900/95 backdrop-blur-sm border-b border-parchment-300 dark:border-primary-800 px-4 py-3 mb-6 -mx-4 -mt-4 rounded-t-xl">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Defi</span>
          </div>

          <div className="flex-1">
            <ProgressBar value={progress} max={100} />
          </div>

          <HeartsDisplay hearts={hearts} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto">
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
    </div>
  );
}

export function DailyChallengeTab() {
  return (
    <QuizProvider>
      <DailyChallengeContent />
    </QuizProvider>
  );
}
