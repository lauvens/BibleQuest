"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { TimedContent, MultipleChoiceContent } from "@/types";
import { Clock } from "lucide-react";

interface TimedProps {
  content: TimedContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function Timed({ content, onAnswer, disabled }: TimedProps) {
  const [timeLeft, setTimeLeft] = useState(content.time_limit);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Assuming the inner question is multiple choice for this implementation
  const question = content.question as MultipleChoiceContent;

  const handleTimeout = useCallback(() => {
    if (!showResult && !timedOut) {
      setTimedOut(true);
      setShowResult(true);
      setTimeout(() => {
        onAnswer(false);
      }, 1000);
    }
  }, [showResult, timedOut, onAnswer]);

  useEffect(() => {
    if (disabled || showResult || timedOut) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, showResult, timedOut, handleTimeout]);

  const handleSelect = (index: number) => {
    if (disabled || showResult || timedOut) return;

    setSelectedIndex(index);
    setShowResult(true);

    const isCorrect = index === question.correct;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  const timePercentage = (timeLeft / content.time_limit) * 100;

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-1000", {
              "bg-green-500": timePercentage > 50,
              "bg-yellow-500": timePercentage > 25 && timePercentage <= 50,
              "bg-red-500": timePercentage <= 25,
            })}
            style={{ width: `${timePercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Clock className={cn("w-4 h-4", {
            "text-green-600 dark:text-green-400": timePercentage > 50,
            "text-yellow-600 dark:text-yellow-400": timePercentage > 25 && timePercentage <= 50,
            "text-red-600 dark:text-red-400 animate-pulse": timePercentage <= 25,
          })} />
          <span className={cn("font-mono font-bold", {
            "text-green-600 dark:text-green-400": timePercentage > 50,
            "text-yellow-600 dark:text-yellow-400": timePercentage > 25 && timePercentage <= 50,
            "text-red-600 dark:text-red-400": timePercentage <= 25,
          })}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {timedOut ? (
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-xl">
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Temps écoulé!</p>
          <p className="text-gray-600 dark:text-gray-400">
            La bonne réponse était: {question.options[question.correct]}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = index === question.correct;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={disabled || showResult}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    "text-gray-900 dark:text-gray-100",
                    {
                      "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20":
                        !showResult,
                      "border-green-500 bg-green-50 dark:bg-green-900/30": showCorrect,
                      "border-red-500 bg-red-50 dark:bg-red-900/30": showWrong,
                    }
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
