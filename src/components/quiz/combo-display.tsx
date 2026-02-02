"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboDisplayProps {
  combo: number;
  className?: string;
}

export function ComboDisplay({ combo, className }: ComboDisplayProps) {
  const getComboColor = () => {
    if (combo >= 5) return "text-error-500";
    if (combo >= 3) return "text-gold-500";
    if (combo >= 2) return "text-accent-500";
    return "text-primary-400";
  };

  const getMultiplier = () => {
    if (combo >= 5) return "x3";
    if (combo >= 4) return "x2.5";
    if (combo >= 3) return "x2";
    if (combo >= 2) return "x1.5";
    return "";
  };

  return (
    <AnimatePresence mode="wait">
      {combo >= 2 && (
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className={cn("flex items-center gap-2", className)}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            {combo >= 5 ? (
              <Zap className={cn("w-6 h-6 fill-current", getComboColor())} />
            ) : (
              <Flame className={cn("w-6 h-6 fill-current", getComboColor())} />
            )}
          </motion.div>
          <div className="text-center">
            <motion.p
              key={`combo-${combo}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn("text-2xl font-bold", getComboColor())}
            >
              {combo}
            </motion.p>
            <p className="text-xs font-semibold text-primary-400">
              COMBO {getMultiplier()}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
