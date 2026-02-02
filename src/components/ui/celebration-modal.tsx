"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Flame, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fireCelebration, fireStars } from "@/lib/confetti";

type CelebrationType = "achievement" | "streak" | "level-up" | "course-complete";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  title: string;
  description?: string;
  reward?: {
    xp?: number;
    coins?: number;
    gems?: number;
  };
}

const iconMap = {
  achievement: Trophy,
  streak: Flame,
  "level-up": Star,
  "course-complete": Gift,
};

const colorMap = {
  achievement: "from-gold-400 to-gold-500",
  streak: "from-gold-400 to-error-500",
  "level-up": "from-accent-400 to-accent-500",
  "course-complete": "from-accent-400 to-accent-600",
};

export function CelebrationModal({
  isOpen,
  onClose,
  type,
  title,
  description,
  reward,
}: CelebrationModalProps) {
  const Icon = iconMap[type];
  const gradient = colorMap[type];

  useEffect(() => {
    if (isOpen) {
      if (type === "streak") {
        fireStars();
      } else {
        fireCelebration();
      }
    }
  }, [isOpen, type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-sm bg-parchment-50 dark:bg-primary-800 rounded-3xl p-8 text-center shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
            >
              <X className="w-5 h-5 text-primary-400" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-elevated`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2"
            >
              {title}
            </motion.h2>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-primary-500 dark:text-primary-400 mb-6"
              >
                {description}
              </motion.p>
            )}

            {/* Rewards */}
            {reward && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-4 mb-6"
              >
                {reward.xp && (
                  <div className="px-4 py-2 rounded-xl bg-accent-100 dark:bg-accent-900/30">
                    <span className="font-bold text-accent-600 dark:text-accent-400">+{reward.xp} XP</span>
                  </div>
                )}
                {reward.coins && (
                  <div className="px-4 py-2 rounded-xl bg-gold-100 dark:bg-gold-900/30">
                    <span className="font-bold text-gold-600 dark:text-gold-400">+{reward.coins}</span>
                  </div>
                )}
                {reward.gems && (
                  <div className="px-4 py-2 rounded-xl bg-info-100 dark:bg-info-900/30">
                    <span className="font-bold text-info-600 dark:text-info-400">+{reward.gems}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onClose} className="w-full">
                Continuer
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
