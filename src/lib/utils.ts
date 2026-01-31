import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function calculateLevel(xp: number): number {
  // Level thresholds: 0, 100, 250, 500, 850, 1300, 1850, 2500, ...
  // Formula: threshold(n) = 50 * n * (n + 1)
  let level = 1;
  let threshold = 100;
  while (xp >= threshold) {
    level++;
    threshold = 50 * level * (level + 1);
  }
  return level;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export function xpForNextLevel(level: number): number {
  return 50 * level * (level + 1);
}

export function calculateHearts(hearts: number, heartsUpdatedAt: Date, maxHearts = 5): number {
  const now = new Date();
  const diffMs = now.getTime() - new Date(heartsUpdatedAt).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const regenerated = Math.floor(diffMinutes / 30);
  return Math.min(maxHearts, hearts + regenerated);
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 15) return 1.5;
  if (streak >= 8) return 1.25;
  return 1;
}

/**
 * Get seconds until next heart regeneration
 * @returns seconds remaining, or null if hearts are full
 */
export function getTimeToNextHeart(
  hearts: number,
  heartsUpdatedAt: Date,
  maxHearts = 5
): number | null {
  if (hearts >= maxHearts) return null;

  const now = new Date();
  const updatedAt = new Date(heartsUpdatedAt);
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  // Hearts regenerate every 30 minutes
  const REGEN_INTERVAL = 30;
  const minutesSinceLastRegen = diffMinutes % REGEN_INTERVAL;
  const minutesUntilNext = REGEN_INTERVAL - minutesSinceLastRegen;

  return Math.max(0, Math.floor(minutesUntilNext * 60));
}

/**
 * Format seconds as MM:SS
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
