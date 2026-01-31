"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageContent } from "@/types";
import { Check, X } from "lucide-react";

interface ImageQuestionProps {
  content: ImageContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function ImageQuestion({ content, onAnswer, disabled }: ImageQuestionProps) {
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
    <div className="space-y-6">
      {/* Image */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={content.image_url}
          alt="Question image"
          fill
          className="object-contain"
        />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        {content.question}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
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
                "p-4 rounded-xl border-2 text-center transition-all",
                "flex items-center justify-center gap-2",
                {
                  "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20":
                    !showResult && !isSelected,
                  "border-primary-500 bg-primary-50 dark:bg-primary-900/30": isSelected && !showResult,
                  "border-green-500 bg-green-50 dark:bg-green-900/30": showCorrect,
                  "border-red-500 bg-red-50 dark:bg-red-900/30": showWrong,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
            >
              <span className={cn("font-medium text-gray-900 dark:text-gray-100", {
                "text-green-700 dark:text-green-400": showCorrect,
                "text-red-700 dark:text-red-400": showWrong,
              })}>
                {option}
              </span>
              {showCorrect && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
              {showWrong && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
