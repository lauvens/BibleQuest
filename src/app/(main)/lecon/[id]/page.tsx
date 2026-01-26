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
import { cn } from "@/lib/utils";
import { QuestionType, QuestionContent } from "@/types";

// Sample lesson data - in production this would come from Supabase
const sampleQuestions: { type: QuestionType; content: QuestionContent }[] = [
  {
    type: "multiple_choice",
    content: {
      question: "Qui a construit l'arche selon la Bible?",
      options: ["Abraham", "Moise", "Noe", "David"],
      correct: 2,
    },
  },
  {
    type: "true_false",
    content: {
      statement: "David a tue Goliath avec une epee.",
      correct: false,
    },
  },
  {
    type: "fill_blank",
    content: {
      verse: "Au commencement, Dieu crea ___ et la terre.",
      answer: "les cieux",
      reference: "Genese 1:1",
    },
  },
  {
    type: "multiple_choice",
    content: {
      question: "Combien de jours Dieu a-t-il pris pour creer le monde?",
      options: ["5 jours", "6 jours", "7 jours", "10 jours"],
      correct: 1,
    },
  },
  {
    type: "true_false",
    content: {
      statement: "Adam et Eve ont ete crees le sixieme jour.",
      correct: true,
    },
  },
];

const lessonData = {
  l1: { name: "Au commencement", xp: 15, coins: 10 },
  l2: { name: "Le jardin d'Eden", xp: 15, coins: 10 },
  l3: { name: "La chute", xp: 15, coins: 10 },
  l4: { name: "Abraham", xp: 20, coins: 15 },
  l5: { name: "Isaac", xp: 20, coins: 15 },
};

export default function LeconPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const {
    getActualHearts,
    loseHeart,
    addXp,
    addCoins,
    updateStreak,
    isGuest,
    updateGuestProgress,
  } = useUserStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hearts = getActualHearts();
  const lesson = lessonData[lessonId as keyof typeof lessonData] || {
    name: "Lecon",
    xp: 10,
    coins: 5,
  };

  const progress = (currentQuestionIndex / sampleQuestions.length) * 100;
  const currentQuestion = sampleQuestions[currentQuestionIndex];

  useEffect(() => {
    // Update streak when starting a lesson
    updateStreak();
  }, [updateStreak]);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      const hasHearts = loseHeart();
      if (!hasHearts && getActualHearts() <= 0) {
        // No hearts left - end lesson
        setIsComplete(true);
        return;
      }
    }

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex < sampleQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Lesson complete
        const score = Math.round(
          (correctAnswers + (correct ? 1 : 0)) / sampleQuestions.length * 100
        );

        // Award XP and coins based on score
        const xpEarned = Math.round(lesson.xp * (score / 100));
        const coinsEarned = Math.round(lesson.coins * (score / 100));

        addXp(xpEarned);
        addCoins(coinsEarned);

        if (isGuest) {
          updateGuestProgress(lessonId, score, score >= 70);
        }

        setIsComplete(true);
      }
    }, 1500);
  };

  const finalScore = Math.round((correctAnswers / sampleQuestions.length) * 100);
  const passed = finalScore >= 70;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {hearts <= 0 ? (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Plus de coeurs!
                </h1>
                <p className="text-gray-600 mb-6">
                  Attendez que vos coeurs se regenerent ou achetez-en dans la boutique.
                </p>
              </>
            ) : passed ? (
              <>
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Felicitations!
                </h1>
                <p className="text-gray-600 mb-4">
                  Vous avez termine la lecon avec {finalScore}%
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-xp">
                      +{Math.round(lesson.xp * (finalScore / 100))}
                    </p>
                    <p className="text-sm text-gray-500">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-500">
                      +{Math.round(lesson.coins * (finalScore / 100))}
                    </p>
                    <p className="text-sm text-gray-500">Pieces</p>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={cn("w-8 h-8", {
                        "fill-yellow-400 text-yellow-400":
                          (star === 1 && finalScore >= 50) ||
                          (star === 2 && finalScore >= 80) ||
                          (star === 3 && finalScore === 100),
                        "text-gray-300":
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
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-gray-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pas tout a fait...
                </h1>
                <p className="text-gray-600 mb-6">
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
                  Reessayer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>

          <div className="flex-1">
            <ProgressBar value={progress} max={100} />
          </div>

          <HeartsDisplay hearts={hearts} />
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Quitter la lecon?
              </h2>
              <p className="text-gray-600 mb-6">
                Votre progression ne sera pas sauvegardee.
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
                  Continuer la lecon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
