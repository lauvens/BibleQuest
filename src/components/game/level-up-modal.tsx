"use client";

import { useEffect, useCallback } from "react";
import { Sparkles, Star } from "lucide-react";
import { useLevelUpStore } from "@/lib/store/level-up-store";
import { Button } from "@/components/ui/button";

export function LevelUpModal() {
  const { isOpen, newLevel, hide } = useLevelUpStore();

  const handleClose = useCallback(() => {
    hide();
  }, [hide]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(handleClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen || !newLevel) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative p-8 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-4 left-8 w-6 h-6 text-gold-400 fill-gold-400 animate-pulse" />
          <Star className="absolute top-12 right-6 w-4 h-4 text-gold-300 fill-gold-300 animate-pulse delay-100" />
          <Star className="absolute bottom-8 left-4 w-5 h-5 text-gold-400 fill-gold-400 animate-pulse delay-200" />
          <Star className="absolute bottom-16 right-8 w-3 h-3 text-gold-300 fill-gold-300 animate-pulse delay-300" />
          <Sparkles className="absolute top-6 right-16 w-5 h-5 text-gold-500 animate-pulse delay-150" />
          <Sparkles className="absolute bottom-12 left-12 w-4 h-4 text-gold-400 animate-pulse delay-250" />
        </div>

        {/* Content */}
        <div className="relative text-center">
          {/* Level badge */}
          <div className="animate-level-up">
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gold-400/30 blur-xl animate-pulse" />

              {/* Level circle */}
              <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 dark:from-gold-400 dark:via-gold-500 dark:to-gold-600 shadow-lg flex items-center justify-center animate-level-pulse">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-700 dark:to-gold-800 flex items-center justify-center">
                  <span className="text-5xl font-black bg-gradient-to-b from-gold-600 to-gold-800 dark:from-gold-200 dark:to-gold-400 bg-clip-text text-transparent">
                    {newLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h2 className="text-2xl font-bold text-parchment-100">
              Niveau Supérieur!
            </h2>
            <p className="mt-2 text-parchment-300">
              Félicitations! Vous avez atteint le niveau {newLevel}
            </p>
          </div>

          {/* Continue button */}
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Button onClick={handleClose} className="btn-gold px-8">
              Continuer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
