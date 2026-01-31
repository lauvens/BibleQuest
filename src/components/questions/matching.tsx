"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MatchingContent } from "@/types";
import { Check, X } from "lucide-react";

interface MatchingProps {
  content: MatchingContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function Matching({ content, onAnswer, disabled }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Shuffle the right side options
    const shuffled = [...content.pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [content.pairs]);

  const handleLeftClick = (index: number) => {
    if (disabled || showResult || matches[index] !== undefined) return;
    setSelectedLeft(index);
  };

  const handleRightClick = (rightIndex: number) => {
    if (disabled || showResult || selectedLeft === null) return;

    // Check if this right option is already matched
    const alreadyMatched = Object.values(matches).includes(rightIndex);
    if (alreadyMatched) return;

    const newMatches = { ...matches, [selectedLeft]: rightIndex };
    setMatches(newMatches);
    setSelectedLeft(null);

    // Check if all pairs are matched
    if (Object.keys(newMatches).length === content.pairs.length) {
      setShowResult(true);

      // Check if all matches are correct
      const allCorrect = content.pairs.every((pair, leftIndex) => {
        const rightIndex = newMatches[leftIndex];
        return shuffledRight[rightIndex] === pair.right;
      });

      setTimeout(() => {
        onAnswer(allCorrect);
      }, 1500);
    }
  };

  const isMatchCorrect = (leftIndex: number) => {
    if (!showResult || matches[leftIndex] === undefined) return null;
    const rightValue = shuffledRight[matches[leftIndex]];
    return content.pairs[leftIndex].right === rightValue;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">
        Associez les éléments correspondants
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          {content.pairs.map((pair, index) => {
            const isSelected = selectedLeft === index;
            const isMatched = matches[index] !== undefined;
            const matchResult = isMatchCorrect(index);

            return (
              <button
                key={`left-${index}`}
                onClick={() => handleLeftClick(index)}
                disabled={disabled || showResult || isMatched}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-sm font-medium transition-all",
                  "text-gray-900 dark:text-gray-100",
                  {
                    "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600": !isSelected && !isMatched,
                    "border-primary-500 bg-primary-50 dark:bg-primary-900/30": isSelected,
                    "border-green-500 bg-green-50 dark:bg-green-900/30": matchResult === true,
                    "border-red-500 bg-red-50 dark:bg-red-900/30": matchResult === false,
                    "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800": isMatched && !showResult,
                    "cursor-not-allowed": disabled || isMatched,
                  }
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{pair.left}</span>
                  {matchResult === true && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  {matchResult === false && <X className="w-4 h-4 text-red-600 dark:text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {shuffledRight.map((item, index) => {
            const isMatched = Object.values(matches).includes(index);
            const matchedLeftIndex = Object.entries(matches).find(
              ([, rightIdx]) => rightIdx === index
            )?.[0];
            const matchResult = matchedLeftIndex !== undefined
              ? isMatchCorrect(parseInt(matchedLeftIndex))
              : null;

            return (
              <button
                key={`right-${index}`}
                onClick={() => handleRightClick(index)}
                disabled={disabled || showResult || isMatched || selectedLeft === null}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-sm font-medium transition-all",
                  "text-gray-900 dark:text-gray-100",
                  {
                    "border-gray-200 dark:border-gray-700": !isMatched && selectedLeft === null,
                    "border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20":
                      !isMatched && selectedLeft !== null,
                    "border-green-500 bg-green-50 dark:bg-green-900/30": matchResult === true,
                    "border-red-500 bg-red-50 dark:bg-red-900/30": matchResult === false,
                    "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800": isMatched && !showResult,
                    "cursor-not-allowed": disabled || isMatched,
                  }
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
