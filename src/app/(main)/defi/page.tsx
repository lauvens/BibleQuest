"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Trophy, Clock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { useUserStore } from "@/lib/store/user-store";
import { QuestionType, QuestionContent } from "@/types";

// Sample daily challenge questions
const challengeQuestions: { type: QuestionType; content: QuestionContent }[] = [
  {
    type: "multiple_choice",
    content: {
      question: "Quel prophète a été avalé par un grand poisson?",
      options: ["Elie", "Jonas", "Elisee", "Daniel"],
      correct: 1,
    },
  },
  {
    type: "true_false",
    content: {
      statement: "Moïse a reçu les Dix Commandements sur le Mont Sinaï.",
      correct: true,
    },
  },
  {
    type: "multiple_choice",
    content: {
      question: "Combien d'apotres Jesus avait-il?",
      options: ["10", "11", "12", "13"],
      correct: 2,
    },
  },
  {
    type: "fill_blank",
    content: {
      verse: "Car Dieu a tant aime le ___ qu'il a donne son Fils unique.",
      answer: "monde",
      reference: "Jean 3:16",
    },
  },
  {
    type: "true_false",
    content: {
      statement: "Le livre des Psaumes a été écrit uniquement par David.",
      correct: false,
    },
  },
  {
    type: "multiple_choice",
    content: {
      question: "Qui était le père de Salomon?",
      options: ["Saul", "David", "Samuel", "Nathan"],
      correct: 1,
    },
  },
  {
    type: "multiple_choice",
    content: {
      question: "Dans quelle ville Jésus est-il né?",
      options: ["Nazareth", "Jérusalem", "Bethléem", "Capharnaüm"],
      correct: 2,
    },
  },
  {
    type: "true_false",
    content: {
      statement: "Paul était l'un des 12 apôtres originaux.",
      correct: false,
    },
  },
  {
    type: "multiple_choice",
    content: {
      question: "Quel est le premier livre de la Bible ?",
      options: ["Exode", "Genèse", "Lévitique", "Nombres"],
      correct: 1,
    },
  },
  {
    type: "fill_blank",
    content: {
      verse: "L'Eternel est mon ___; je ne manquerai de rien.",
      answer: "berger",
      reference: "Psaume 23:1",
    },
  },
];

export default function DefiPage() {
  const router = useRouter();
  const { getActualHearts, loseHeart, addXp, addCoins, updateStreak } = useUserStore();

  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const hearts = getActualHearts();
  const progress = (currentQuestionIndex / challengeQuestions.length) * 100;
  const currentQuestion = challengeQuestions[currentQuestionIndex];

  const handleStart = () => {
    updateStreak();
    setStarted(true);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      loseHeart();
    }

    setTimeout(() => {
      if (currentQuestionIndex < challengeQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        const finalCorrect = correctAnswers + (correct ? 1 : 0);
        const score = Math.round((finalCorrect / challengeQuestions.length) * 100);

        // Daily challenge rewards
        const xpEarned = 25 + Math.round(25 * (score / 100));
        const coinsEarned = 15 + Math.round(15 * (score / 100));

        addXp(xpEarned);
        addCoins(coinsEarned);

        setIsComplete(true);
      }
    }, 1500);
  };

  const finalScore = Math.round((correctAnswers / challengeQuestions.length) * 100);

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-white text-center">
            <Target className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Défi Quotidien</h1>
            <p className="text-white/90">
              10 questions pour tester vos connaissances
            </p>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">10 questions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Zap className="w-6 h-6 text-xp mx-auto mb-2" />
                <p className="text-sm text-gray-600">Jusqu&apos;à 50 XP</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Trophy className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Jusqu&apos;à 30 pièces</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-600">Vos cœurs:</span>
              <HeartsDisplay hearts={hearts} />
            </div>

            <Button
              onClick={handleStart}
              disabled={hearts <= 0}
              className="w-full"
              size="lg"
            >
              {hearts <= 0 ? "Pas assez de cœurs" : "Commencer le défi"}
            </Button>

            {hearts <= 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Vos cœurs se régénèrent toutes les 30 minutes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Défi terminé!
            </h1>
            <p className="text-gray-600 mb-4">
              Vous avez obtenu {finalScore}% de bonnes réponses
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-xp">
                  +{25 + Math.round(25 * (finalScore / 100))}
                </p>
                <p className="text-sm text-gray-500">XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gold-500">
                  +{15 + Math.round(15 * (finalScore / 100))}
                </p>
                <p className="text-sm text-gray-500">Pièces</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary-600">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Défi</span>
          </div>

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
            <p className="text-sm text-gray-500 mb-4 text-center">
              Question {currentQuestionIndex + 1} / {challengeQuestions.length}
            </p>
            <QuestionRenderer
              type={currentQuestion.type}
              content={currentQuestion.content}
              onAnswer={handleAnswer}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
