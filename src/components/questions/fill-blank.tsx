"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FillBlankContent } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface FillBlankProps {
  content: FillBlankContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function FillBlank({ content, onAnswer, disabled }: FillBlankProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (disabled || showResult || !userAnswer.trim()) return;

    const correct = userAnswer.trim().toLowerCase() === content.answer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Split the verse by ___ to show the blank
  const parts = content.verse.split("___");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-primary-400 dark:text-primary-400 mb-2">{content.reference}</p>
        <p className="text-xl text-primary-800 dark:text-parchment-100">
          {parts[0]}
          <span className={cn(
            "inline-block min-w-[100px] border-b-2 mx-1 px-2",
            {
              "border-primary-400 dark:border-primary-500": !showResult,
              "border-olive-500 text-olive-700 dark:text-olive-400": showResult && isCorrect,
              "border-error-500 text-error-700 dark:text-error-400": showResult && !isCorrect,
            }
          )}>
            {showResult ? (isCorrect ? userAnswer : content.answer) : userAnswer || "___"}
          </span>
          {parts[1]}
        </p>
      </div>

      {!showResult ? (
        <div className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre réponse..."
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-parchment-300 dark:border-primary-700 rounded-xl focus:border-primary-500 focus:outline-none text-center text-lg bg-parchment-50 dark:bg-primary-800 text-primary-800 dark:text-parchment-100"
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || !userAnswer.trim()}
            className="w-full"
          >
            Vérifier
          </Button>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-2 p-4 rounded-xl",
          {
            "bg-olive-50 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400": isCorrect,
            "bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400": !isCorrect,
          }
        )}>
          {isCorrect ? (
            <>
              <Check className="w-6 h-6" />
              <span className="font-medium">Correct!</span>
            </>
          ) : (
            <>
              <X className="w-6 h-6" />
              <span className="font-medium">
                La bonne réponse était: {content.answer}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
