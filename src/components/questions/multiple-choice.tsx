"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MultipleChoiceContent } from "@/types";
import { Check, X } from "lucide-react";

interface MultipleChoiceProps {
  content: MultipleChoiceContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function MultipleChoice({ content, onAnswer, disabled }: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (disabled || showResult) return;

    setSelectedIndex(index);
    setShowResult(true);

    const isCorrect = index === content.correct;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-100 text-center mb-6">
        {content.question}
      </h2>

      <div className="space-y-3">
        {content.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === content.correct;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={disabled || showResult}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                "flex items-center justify-between",
                {
                  "border-parchment-300 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-parchment-100 dark:hover:bg-primary-700":
                    !showResult && !isSelected,
                  "border-primary-500 bg-primary-50 dark:bg-primary-700": isSelected && !showResult,
                  "border-olive-500 bg-olive-50 dark:bg-olive-900/30": showCorrect,
                  "border-error-500 bg-error-50 dark:bg-error-900/30": showWrong,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
            >
              <span className={cn("font-medium text-primary-800 dark:text-parchment-100", {
                "text-olive-700 dark:text-olive-400": showCorrect,
                "text-error-700 dark:text-error-400": showWrong,
              })}>
                {option}
              </span>
              {showCorrect && <Check className="w-6 h-6 text-olive-600 dark:text-olive-400" />}
              {showWrong && <X className="w-6 h-6 text-error-600 dark:text-error-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
