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
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
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
                  "border-gray-200 hover:border-primary-300 hover:bg-primary-50":
                    !showResult && !isSelected,
                  "border-primary-500 bg-primary-50": isSelected && !showResult,
                  "border-green-500 bg-green-50": showCorrect,
                  "border-red-500 bg-red-50": showWrong,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
            >
              <span className={cn("font-medium", {
                "text-green-700": showCorrect,
                "text-red-700": showWrong,
              })}>
                {option}
              </span>
              {showCorrect && <Check className="w-6 h-6 text-green-600" />}
              {showWrong && <X className="w-6 h-6 text-red-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
