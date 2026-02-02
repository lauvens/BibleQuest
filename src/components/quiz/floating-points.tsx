"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
  isBonus?: boolean;
}

interface FloatingPointsProps {
  points: FloatingPoint[];
}

export function FloatingPoints({ points }: FloatingPointsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 1, y: point.y, x: point.x, scale: 0.5 }}
            animate={{ opacity: 0, y: point.y - 100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute text-2xl font-bold drop-shadow-lg ${
              point.isBonus ? "text-gold-400" : "text-accent-400"
            }`}
            style={{ transform: "translateX(-50%)" }}
          >
            +{point.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage floating points
export function useFloatingPoints() {
  const [points, setPoints] = useState<FloatingPoint[]>([]);
  const idCounter = useRef(0);

  const addPoint = useCallback((value: number, x: number, y: number, isBonus = false) => {
    const id = idCounter.current++;
    setPoints((prev) => [...prev, { id, value, x, y, isBonus }]);

    // Remove after animation
    setTimeout(() => {
      setPoints((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }, []);

  return { points, addPoint };
}
