import { createClient } from "./client";
import { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

const supabase = () => createClient();

// Categories
export async function getCategories() {
  const { data, error } = await supabase()
    .from("categories")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return data as Tables["categories"]["Row"][];
}

// Units with lesson counts
export async function getUnits(categoryId: string) {
  const { data, error } = await supabase()
    .from("units")
    .select("*, lessons(id)")
    .eq("category_id", categoryId)
    .order("order_index");
  if (error) throw error;
  return data as (Tables["units"]["Row"] & { lessons: { id: string }[] })[];
}

// Lessons for a unit
export async function getLessons(unitId: string) {
  const { data, error } = await supabase()
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index");
  if (error) throw error;
  return data as Tables["lessons"]["Row"][];
}

// Lesson by ID
export async function getLesson(lessonId: string) {
  const { data, error } = await supabase()
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();
  if (error) throw error;
  return data as Tables["lessons"]["Row"];
}

// Questions for a lesson
export async function getQuestions(lessonId: string) {
  const { data, error } = await supabase()
    .from("questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("is_approved", true);
  if (error) throw error;
  return data as Tables["questions"]["Row"][];
}

// Random questions for daily challenge
export async function getRandomQuestions(limit: number = 10) {
  // Supabase doesn't support ORDER BY random() directly via client,
  // so we fetch more and shuffle client-side
  const { data, error } = await supabase()
    .from("questions")
    .select("*")
    .eq("is_approved", true);
  if (error) throw error;
  const questions = data as Tables["questions"]["Row"][];
  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, limit);
}

// User progress
export async function getUserProgress(userId: string) {
  const { data, error } = await supabase()
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data as Tables["user_progress"]["Row"][];
}

// Save progress after lesson completion
export async function saveProgress(
  userId: string,
  lessonId: string,
  score: number,
  completed: boolean
) {
  const { error } = await supabase()
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed,
        best_score: score,
        attempts: 1,
        last_attempt_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
  if (error) throw error;
}

// Update user XP/coins and streak in Supabase
export async function updateUserStats(
  userId: string,
  xpEarned: number,
  coinsEarned: number
) {
  // First get current values
  const { data: user, error: fetchError } = await supabase()
    .from("users")
    .select("xp, coins, current_streak, longest_streak, last_activity_date")
    .eq("id", userId)
    .single();
  if (fetchError) throw fetchError;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = user.last_activity_date;
  let newStreak = 1;
  if (lastDate === today) {
    newStreak = user.current_streak;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate === yesterday.toISOString().split("T")[0]) {
      newStreak = user.current_streak + 1;
    }
  }

  const { error } = await supabase()
    .from("users")
    .update({
      xp: user.xp + xpEarned,
      coins: user.coins + coinsEarned,
      current_streak: newStreak,
      longest_streak: Math.max(user.longest_streak, newStreak),
      last_activity_date: today,
    })
    .eq("id", userId);
  if (error) throw error;
}

// Leaderboard - fetch top users by XP
export async function getLeaderboard(limit: number = 20) {
  const { data, error } = await supabase()
    .from("users")
    .select("id, username, avatar_url, xp")
    .order("xp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// User stats for profile
export async function getUserStats(userId: string) {
  const { data: progress, error } = await supabase()
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;

  const lessonsCompleted = progress.filter((p) => p.completed).length;
  const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
  const avgScore =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, p) => sum + p.best_score, 0) / progress.length
        )
      : 0;

  return { lessonsCompleted, totalAttempts, avgScore };
}

// User achievements
export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase()
    .from("achievements")
    .select("*, user_achievements!left(user_id)")
    .order("condition_value");
  if (error) throw error;

  return data.map((a) => ({
    ...a,
    unlocked: (a.user_achievements as { user_id: string }[])?.some(
      (ua) => ua.user_id === userId
    ) ?? false,
  }));
}

// Daily verse - deterministic rotation based on day of year
export async function getDailyVerse() {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("text, book, chapter, verse");
  if (error) throw error;
  if (!data || data.length === 0) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % data.length;
  const v = data[index];
  return { text: v.text, reference: `${v.book} ${v.chapter}:${v.verse}` };
}

// Update username
export async function updateUsername(userId: string, username: string) {
  const { error } = await supabase()
    .from("users")
    .update({ username })
    .eq("id", userId);
  if (error) throw error;
}

// Get user's owned cosmetics
export async function getUserCosmetics(userId: string) {
  const { data, error } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id, is_equipped, cosmetics(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((uc) => ({
    cosmetic_id: uc.cosmetic_id as string,
    is_equipped: uc.is_equipped as boolean,
    cosmetics: uc.cosmetics as unknown as Tables["cosmetics"]["Row"],
  }));
}

// Get all available cosmetics (for browsing)
export async function getAllCosmetics() {
  const { data, error } = await supabase()
    .from("cosmetics")
    .select("*")
    .eq("is_active", true);
  if (error) throw error;
  return data as Tables["cosmetics"]["Row"][];
}

// Equip a cosmetic (unequip others of same type first)
export async function equipCosmetic(userId: string, cosmeticId: string, cosmeticType: string) {
  // Get all user cosmetics of this type to unequip them
  const { data: owned } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id, cosmetics(type)")
    .eq("user_id", userId);

  const sameType = (owned ?? []).filter(
    (uc) => (uc.cosmetics as unknown as { type: string })?.type === cosmeticType
  );

  // Unequip all of same type
  for (const uc of sameType) {
    await supabase()
      .from("user_cosmetics")
      .update({ is_equipped: false })
      .eq("user_id", userId)
      .eq("cosmetic_id", uc.cosmetic_id);
  }

  // Equip the chosen one
  const { error } = await supabase()
    .from("user_cosmetics")
    .update({ is_equipped: true })
    .eq("user_id", userId)
    .eq("cosmetic_id", cosmeticId);
  if (error) throw error;
}

// Unequip a cosmetic
export async function unequipCosmetic(userId: string, cosmeticId: string) {
  const { error } = await supabase()
    .from("user_cosmetics")
    .update({ is_equipped: false })
    .eq("user_id", userId)
    .eq("cosmetic_id", cosmeticId);
  if (error) throw error;
}

// Update avatar URL
export async function updateAvatarUrl(userId: string, avatarUrl: string | null) {
  const { error } = await supabase()
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);
  if (error) throw error;
}

// Category with lesson count
export async function getCategoriesWithCounts() {
  const { data, error } = await supabase()
    .from("categories")
    .select("*, units(id, lessons(id))")
    .order("order_index");
  if (error) throw error;

  return (data ?? []).map((cat) => {
    const units = (cat.units as { id: string; lessons: { id: string }[] }[]) ?? [];
    const lessonCount = units.reduce((sum, u) => sum + (u.lessons?.length ?? 0), 0);
    return { ...cat, lessonCount, units: undefined };
  });
}

// Full category data with units, lessons, and progress
export async function getCategoryWithProgress(
  categoryNameKey: string,
  userId?: string | null
) {
  // Get category
  const { data: cat, error: catError } = await supabase()
    .from("categories")
    .select("*")
    .eq("name_key", categoryNameKey)
    .single();
  if (catError) throw catError;

  // Get units with lessons
  const { data: units, error: unitsError } = await supabase()
    .from("units")
    .select("*, lessons(*)")
    .eq("category_id", cat.id)
    .order("order_index");
  if (unitsError) throw unitsError;

  // Get user progress if logged in
  const progressMap: Record<string, { completed: boolean; best_score: number }> = {};
  if (userId) {
    const lessonIds = (units ?? []).flatMap((u) =>
      ((u.lessons as Tables["lessons"]["Row"][]) ?? []).map((l) => l.id)
    );
    if (lessonIds.length > 0) {
      const { data: progress } = await supabase()
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);
      (progress ?? []).forEach((p) => {
        progressMap[p.lesson_id] = {
          completed: p.completed,
          best_score: p.best_score,
        };
      });
    }
  }

  return {
    category: cat as Tables["categories"]["Row"],
    units: (units ?? []).map((u) => {
      const lessons = (u.lessons as Tables["lessons"]["Row"][]) ?? [];
      const sortedLessons = [...lessons].sort(
        (a, b) => a.order_index - b.order_index
      );
      const completedCount = sortedLessons.filter(
        (l) => progressMap[l.id]?.completed
      ).length;
      const progress =
        sortedLessons.length > 0
          ? Math.round((completedCount / sortedLessons.length) * 100)
          : 0;
      return {
        ...u,
        lessons: sortedLessons.map((l) => ({
          ...l,
          completed: progressMap[l.id]?.completed ?? false,
          bestScore: progressMap[l.id]?.best_score ?? 0,
        })),
        progress,
        completedCount,
      };
    }),
  };
}
