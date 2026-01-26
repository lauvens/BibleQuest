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
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
        Associez les elements correspondants
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
                  {
                    "border-gray-200 hover:border-primary-300": !isSelected && !isMatched,
                    "border-primary-500 bg-primary-50": isSelected,
                    "border-green-500 bg-green-50": matchResult === true,
                    "border-red-500 bg-red-50": matchResult === false,
                    "border-gray-300 bg-gray-100": isMatched && !showResult,
                    "cursor-not-allowed": disabled || isMatched,
                  }
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{pair.left}</span>
                  {matchResult === true && <Check className="w-4 h-4 text-green-600" />}
                  {matchResult === false && <X className="w-4 h-4 text-red-600" />}
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
                  {
                    "border-gray-200": !isMatched && selectedLeft === null,
                    "border-primary-200 hover:border-primary-400 hover:bg-primary-50":
                      !isMatched && selectedLeft !== null,
                    "border-green-500 bg-green-50": matchResult === true,
                    "border-red-500 bg-red-50": matchResult === false,
                    "border-gray-300 bg-gray-100": isMatched && !showResult,
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
