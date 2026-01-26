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
        <p className="text-sm text-gray-500 mb-2">{content.reference}</p>
        <p className="text-xl text-gray-900">
          {parts[0]}
          <span className={cn(
            "inline-block min-w-[100px] border-b-2 mx-1 px-2",
            {
              "border-gray-400": !showResult,
              "border-green-500 text-green-700": showResult && isCorrect,
              "border-red-500 text-red-700": showResult && !isCorrect,
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
            placeholder="Tapez votre reponse..."
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-center text-lg"
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || !userAnswer.trim()}
            className="w-full"
          >
            Verifier
          </Button>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-2 p-4 rounded-xl",
          {
            "bg-green-50 text-green-700": isCorrect,
            "bg-red-50 text-red-700": !isCorrect,
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
                La bonne reponse etait: {content.answer}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
