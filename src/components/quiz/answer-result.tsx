"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerResultProps {
  isVisible: boolean;
  isCorrect: boolean;
  pointsEarned?: number;
  timeBonus?: number;
  comboMultiplier?: number;
  explanation?: string;
  verseReference?: string;
  onContinue: () => void;
}

export function AnswerResult({
  isVisible,
  isCorrect,
  pointsEarned = 0,
  timeBonus = 0,
  comboMultiplier = 1,
  explanation,
  verseReference,
  onContinue,
}: AnswerResultProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-gradient-to-t from-black/50 to-transparent"
          onClick={onContinue}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "w-full max-w-lg rounded-t-3xl p-6 shadow-elevated",
              isCorrect
                ? "bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/80 dark:to-accent-800/80"
                : "bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/80 dark:to-error-800/80"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.1 }}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center",
                  isCorrect ? "bg-accent-400" : "bg-error-400"
                )}
              >
                {isCorrect ? (
                  <Check className="w-8 h-8 text-white" />
                ) : (
                  <X className="w-8 h-8 text-white" />
                )}
              </motion.div>
              <div>
                <h3
                  className={cn(
                    "text-xl font-bold",
                    isCorrect
                      ? "text-accent-700 dark:text-accent-300"
                      : "text-error-700 dark:text-error-300"
                  )}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </h3>
                {isCorrect && pointsEarned > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="font-bold text-accent-600 dark:text-accent-400">
                      +{pointsEarned} pts
                    </span>
                    {timeBonus > 0 && (
                      <span className="flex items-center gap-1 text-gold-600 dark:text-gold-400">
                        <Clock className="w-3 h-3" />
                        +{timeBonus} bonus
                      </span>
                    )}
                    {comboMultiplier > 1 && (
                      <span className="flex items-center gap-1 text-error-500">
                        <Flame className="w-3 h-3 fill-current" />
                        x{comboMultiplier}
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 p-4 rounded-xl bg-white/50 dark:bg-primary-800/50"
              >
                <p className="text-primary-700 dark:text-parchment-100">{explanation}</p>
              </motion.div>
            )}

            {/* Verse reference */}
            {verseReference && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400 mb-4"
              >
                <BookOpen className="w-4 h-4" />
                <span>{verseReference}</span>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onContinue}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-colors",
                isCorrect ? "bg-accent-500 hover:bg-accent-600" : "bg-error-500 hover:bg-error-600"
              )}
            >
              Continuer
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
