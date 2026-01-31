"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { TypingContent } from "@/types";
import { Check, X } from "lucide-react";

interface TypingProps {
  content: TypingContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function Typing({ content, onAnswer, disabled }: TypingProps) {
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  const words = content.text.split(" ");

  const calculateAccuracy = useCallback((input: string) => {
    const inputWords = input.trim().split(/\s+/);
    let correct = 0;

    words.forEach((word, index) => {
      if (inputWords[index]?.toLowerCase() === word.toLowerCase()) {
        correct++;
      }
    });

    return Math.round((correct / words.length) * 100);
  }, [words]);

  useEffect(() => {
    if (!showResult) {
      setAccuracy(calculateAccuracy(userInput));
    }
  }, [userInput, showResult, calculateAccuracy]);

  const handleSubmit = () => {
    if (disabled || showResult) return;

    const finalAccuracy = calculateAccuracy(userInput);
    setAccuracy(finalAccuracy);
    setShowResult(true);

    // Consider 80% accuracy as passing
    const isCorrect = finalAccuracy >= 80;

    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  const renderHighlightedText = () => {
    const inputWords = userInput.trim().split(/\s+/);

    return words.map((word, index) => {
      const inputWord = inputWords[index] || "";
      const isCorrect = inputWord.toLowerCase() === word.toLowerCase();
      const hasTyped = inputWord.length > 0;

      return (
        <span
          key={index}
          className={cn("transition-colors", {
            "text-olive-600 dark:text-olive-400": hasTyped && isCorrect,
            "text-error-600 dark:text-error-400": hasTyped && !isCorrect,
            "text-primary-400 dark:text-primary-500": !hasTyped,
          })}
        >
          {word}{" "}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-primary-400 dark:text-primary-400 mb-2">{content.reference}</p>
        <h2 className="text-lg font-medium text-primary-800 dark:text-parchment-100 mb-4">
          {content.prompt}
        </h2>
      </div>

      {/* Reference text */}
      <div className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
        <p className="text-lg leading-relaxed">{renderHighlightedText()}</p>
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez le verset ici..."
          disabled={disabled || showResult}
          rows={4}
          className="w-full px-4 py-3 border-2 border-parchment-300 dark:border-primary-700 rounded-xl focus:border-primary-500 focus:outline-none resize-none bg-parchment-50 dark:bg-primary-800 text-primary-800 dark:text-parchment-100"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary-500 dark:text-primary-400">
            Précision: <span className={cn({
              "text-olive-600 dark:text-olive-400": accuracy >= 80,
              "text-gold-600 dark:text-gold-400": accuracy >= 50 && accuracy < 80,
              "text-error-600 dark:text-error-400": accuracy < 50,
            })}>{accuracy}%</span>
          </span>
          <span className="text-primary-400">Ctrl+Enter pour valider</span>
        </div>
      </div>

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={disabled || !userInput.trim()}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Vérifier
        </button>
      ) : (
        <div className={cn(
          "flex items-center justify-center gap-2 p-4 rounded-xl",
          {
            "bg-olive-50 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400": accuracy >= 80,
            "bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400": accuracy < 80,
          }
        )}>
          {accuracy >= 80 ? (
            <>
              <Check className="w-6 h-6" />
              <span className="font-medium">Excellent! {accuracy}% de précision</span>
            </>
          ) : (
            <>
              <X className="w-6 h-6" />
              <span className="font-medium">
                {accuracy}% - Il faut au moins 80% pour valider
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
