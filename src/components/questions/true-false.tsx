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
      {
        "border-gray-200 hover:border-primary-300 hover:bg-primary-50":
          !showResult && !isSelected,
        "border-primary-500 bg-primary-50": isSelected && !showResult,
        "border-green-500 bg-green-50 text-green-700": showCorrect,
        "border-red-500 bg-red-50 text-red-700": showWrong,
        "opacity-50 cursor-not-allowed": disabled,
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
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
