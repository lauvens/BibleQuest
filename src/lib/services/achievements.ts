import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

export interface UnlockedAchievement {
  id: string;
  name: string;
  icon: string;
  coin_reward: number;
}

interface CheckContext {
  userId: string;
  lessonsCompleted?: number;
  streak?: number;
  level?: number;
  isPerfectLesson?: boolean;
}

const supabase = () => createClient();

/**
 * Get all achievements from the database
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase()
    .from("achievements")
    .select("*")
    .order("condition_value");

  if (error) throw error;
  return data ?? [];
}

/**
 * Get user's unlocked achievement IDs
 */
async function getUserUnlockedIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase()
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data ?? []).map((ua) => ua.achievement_id));
}

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<void> {
  const { error } = await supabase()
    .from("user_achievements")
    .insert({
      user_id: userId,
      achievement_id: achievementId,
    });

  // Ignore duplicate errors (already unlocked)
  if (error && !error.message.includes("duplicate")) {
    throw error;
  }
}

/**
 * Check and unlock achievements based on context
 * Returns list of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  context: CheckContext
): Promise<UnlockedAchievement[]> {
  const { userId, lessonsCompleted, streak, level, isPerfectLesson } = context;

  const [achievements, unlockedIds] = await Promise.all([
    getAllAchievements(),
    getUserUnlockedIds(userId),
  ]);

  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.condition_type) {
      case "lessons_completed":
        if (
          lessonsCompleted !== undefined &&
          lessonsCompleted >= achievement.condition_value
        ) {
          shouldUnlock = true;
        }
        break;

      case "streak":
        if (streak !== undefined && streak >= achievement.condition_value) {
          shouldUnlock = true;
        }
        break;

      case "level":
        if (level !== undefined && level >= achievement.condition_value) {
          shouldUnlock = true;
        }
        break;

      case "perfect_lesson":
        if (isPerfectLesson && achievement.condition_value === 1) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      try {
        await unlockAchievement(userId, achievement.id);
        // Coins are now awarded when user claims the achievement on /profil/succes

        newlyUnlocked.push({
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon,
          coin_reward: achievement.coin_reward,
        });
      } catch {
        // Continue with other achievements if one fails
        console.error(`Failed to unlock achievement ${achievement.id}`);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Get user's completed lessons count
 */
export async function getUserLessonsCompleted(userId: string): Promise<number> {
  const { count, error } = await supabase()
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true);

  if (error) throw error;
  return count ?? 0;
}
