"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { ComboDisplay } from "./combo-display";
import { AnswerResult } from "./answer-result";
import { FloatingPoints, useFloatingPoints } from "./floating-points";
import { useQuiz } from "@/lib/contexts/quiz-context";
import {
  playCorrectSound,
  playWrongSound,
  playComboSound,
  vibrateCorrect,
  vibrateWrong,
  vibrateCombo,
} from "@/lib/feedback";
import { fireGoldConfetti } from "@/lib/confetti";
import { QuestionType, QuestionContent } from "@/types";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  type: QuestionType;
  content: QuestionContent & {
    explanation?: string;
    verse_reference?: string;
  };
  onComplete: (correct: boolean, points: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizQuestion({
  type,
  content,
  onComplete,
  questionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  const { combo, startQuestion, answerQuestion } = useQuiz();
  const { points: floatingPoints, addPoint } = useFloatingPoints();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    points: number;
    timeBonus: number;
    multiplier: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Start timer when question mounts, stop when answered
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startQuestion();
    setTimeElapsed(0);
    setShowResult(false);
    setAnswered(false);
    setLastResult(null);

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 0.1);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionNumber, startQuestion]);

  // Stop timer when user answers
  useEffect(() => {
    if (answered && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [answered]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (answered) return;
      setAnswered(true);

      const result = answerQuestion(correct);

      // Feedback
      if (correct) {
        playCorrectSound();
        vibrateCorrect();

        if (result.comboMultiplier > 1) {
          playComboSound(combo + 1);
          vibrateCombo();
        }

        if (combo + 1 >= 5) {
          fireGoldConfetti();
        }

        // Floating points at center of screen
        if (typeof window !== "undefined") {
          const x = window.innerWidth / 2;
          const y = window.innerHeight / 2;
          addPoint(result.pointsEarned, x, y);
          if (result.timeBonus > 0) {
            setTimeout(() => {
              addPoint(result.timeBonus, x + 60, y, true);
            }, 200);
          }
        }
      } else {
        playWrongSound();
        vibrateWrong();
      }

      setLastResult({
        correct,
        points: result.pointsEarned,
        timeBonus: result.timeBonus,
        multiplier: result.comboMultiplier,
      });

      // Show result after a short delay to let the question show feedback
      setTimeout(() => {
        setShowResult(true);
      }, 800);
    },
    [answered, answerQuestion, combo, addPoint]
  );

  const handleContinue = () => {
    setShowResult(false);
    onComplete(lastResult?.correct ?? false, lastResult?.points ?? 0);
  };

  const getTimerColor = () => {
    if (timeElapsed < 5) return "text-accent-500";
    if (timeElapsed < 10) return "text-gold-500";
    return "text-error-500";
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Header with timer and combo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary-500 dark:text-primary-400">
            Question {questionNumber}/{totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <motion.div
            key={Math.floor(timeElapsed)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={cn("flex items-center gap-1 font-mono", getTimerColor())}
          >
            <Clock className="w-4 h-4" />
            <span className="font-semibold tabular-nums">{timeElapsed.toFixed(1)}s</span>
          </motion.div>

          {/* Combo */}
          <ComboDisplay combo={combo} />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={questionNumber}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <QuestionRenderer
          type={type}
          content={content}
          onAnswer={handleAnswer}
          disabled={answered}
        />
      </motion.div>

      {/* Floating points */}
      <FloatingPoints points={floatingPoints} />

      {/* Answer result overlay */}
      <AnswerResult
        isVisible={showResult}
        isCorrect={lastResult?.correct ?? false}
        pointsEarned={lastResult?.points}
        timeBonus={lastResult?.timeBonus}
        comboMultiplier={lastResult?.multiplier}
        explanation={content.explanation}
        verseReference={content.verse_reference}
        onContinue={handleContinue}
      />
    </div>
  );
}
