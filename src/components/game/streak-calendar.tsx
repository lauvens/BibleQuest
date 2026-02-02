"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDays: Date[];
  className?: string;
}

export function StreakCalendar({ activeDays, className }: StreakCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const result: Date[][] = [];

    // Get last 12 weeks (84 days)
    for (let w = 11; w >= 0; w--) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        week.push(date);
      }
      result.push(week);
    }
    return result;
  }, []);

  const isActive = (date: Date) => {
    return activeDays.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isFuture = (date: Date) => {
    return date > new Date();
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-gold-500" />
        <span className="font-semibold text-primary-800 dark:text-parchment-50">
          Activité récente
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((date, dayIndex) => (
              <motion.div
                key={dayIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                className={cn(
                  "w-3 h-3 rounded-sm transition-colors",
                  isFuture(date)
                    ? "bg-parchment-200 dark:bg-primary-700"
                    : isActive(date)
                    ? "bg-gold-400 dark:bg-gold-500"
                    : "bg-parchment-300 dark:bg-primary-600",
                  isToday(date) && "ring-2 ring-accent-400 ring-offset-1 dark:ring-offset-primary-800"
                )}
                title={date.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-primary-400">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-parchment-300 dark:bg-primary-600" />
          <div className="w-3 h-3 rounded-sm bg-gold-200 dark:bg-gold-700" />
          <div className="w-3 h-3 rounded-sm bg-gold-400 dark:bg-gold-500" />
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}
