"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TrueFalseContent } from "@/types";
import { Check, X } from "lucide-react";

interface TrueFalseProps {
  content: TrueFalseContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function TrueFalse({ content, onAnswer, disabled }: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (value: boolean) => {
    if (disabled || showResult) return;

    setSelected(value);
    setShowResult(true);

    const isCorrect = value === content.correct;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  const getButtonClass = (value: boolean) => {
    const isSelected = selected === value;
    const isCorrect = value === content.correct;
    const showCorrect = showResult && isCorrect;
    const showWrong = showResult && isSelected && !isCorrect;

    return cn(
      "flex-1 p-6 rounded-xl border-2 font-bold text-lg transition-all",
      "flex items-center justify-center gap-2",
      "text-primary-800 dark:text-parchment-100",
      {
        "border-parchment-300 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-parchment-100 dark:hover:bg-primary-700":
          !showResult && !isSelected,
        "border-primary-500 bg-primary-50 dark:bg-primary-700": isSelected && !showResult,
        "border-olive-500 bg-olive-50 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400": showCorrect,
        "border-error-500 bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400": showWrong,
        "opacity-50 cursor-not-allowed": disabled,
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-100 text-center mb-8">
        {content.statement}
      </h2>

      <div className="flex gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={disabled || showResult}
          className={getButtonClass(true)}
        >
          Vrai
          {showResult && content.correct === true && <Check className="w-6 h-6" />}
          {showResult && selected === true && content.correct !== true && <X className="w-6 h-6" />}
        </button>

        <button
          onClick={() => handleSelect(false)}
          disabled={disabled || showResult}
          className={getButtonClass(false)}
        >
          Faux
          {showResult && content.correct === false && <Check className="w-6 h-6" />}
          {showResult && selected === false && content.correct !== false && <X className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
