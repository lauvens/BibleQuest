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

// Get all verses with optional pagination
export async function getAllVerses(limit: number = 50, offset: number = 0) {
  const { data, error, count } = await supabase()
    .from("bible_verses")
    .select("*", { count: "exact" })
    .order("book")
    .order("chapter")
    .order("verse")
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { verses: data as Tables["bible_verses"]["Row"][], total: count ?? 0 };
}

// Search verses by text content
export async function searchVerses(query: string, limit: number = 50) {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("*")
    .ilike("text", `%${query}%`)
    .order("book")
    .order("chapter")
    .order("verse")
    .limit(limit);
  if (error) throw error;
  return data as Tables["bible_verses"]["Row"][];
}

// Get verses by book name
export async function getVersesByBook(book: string, limit: number = 50) {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("*")
    .eq("book", book)
    .order("chapter")
    .order("verse")
    .limit(limit);
  if (error) throw error;
  return data as Tables["bible_verses"]["Row"][];
}

// Get unique book names
export async function getUniqueBooks() {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("book")
    .order("book");
  if (error) throw error;
  const books = Array.from(new Set((data ?? []).map((v) => v.book)));
  return books;
}

// Get user's favorite verses
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase()
    .from("user_verses")
    .select("verse_id, created_at, bible_verses(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((uv) => {
    const verse = uv.bible_verses as unknown as Tables["bible_verses"]["Row"];
    return {
      ...verse,
      favorited_at: uv.created_at,
    };
  });
}

// Toggle favorite status for a verse
export async function toggleFavorite(userId: string, verseId: string): Promise<boolean> {
  // Check if already favorited
  const { data: existing } = await supabase()
    .from("user_verses")
    .select("id")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase()
      .from("user_verses")
      .delete()
      .eq("user_id", userId)
      .eq("verse_id", verseId);
    if (error) throw error;
    return false; // Not favorited anymore
  } else {
    // Add favorite
    const { error } = await supabase()
      .from("user_verses")
      .insert({ user_id: userId, verse_id: verseId });
    if (error) throw error;
    return true; // Now favorited
  }
}

// Check if a verse is favorited
export async function isFavorite(userId: string, verseId: string): Promise<boolean> {
  const { data } = await supabase()
    .from("user_verses")
    .select("id")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .single();
  return !!data;
}

// Get user's favorite verse IDs (for bulk checking)
export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase()
    .from("user_verses")
    .select("verse_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((uv) => uv.verse_id));
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

// Purchase a cosmetic (deduct currency and add to user_cosmetics)
export async function purchaseCosmetic(
  userId: string,
  cosmeticId: string
): Promise<{ success: boolean; error?: string }> {
  // Get the cosmetic details
  const { data: cosmetic, error: cosmeticError } = await supabase()
    .from("cosmetics")
    .select("*")
    .eq("id", cosmeticId)
    .eq("is_active", true)
    .single();

  if (cosmeticError || !cosmetic) {
    return { success: false, error: "Cosmétique introuvable" };
  }

  // Check if already owned
  const { data: existing } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id")
    .eq("user_id", userId)
    .eq("cosmetic_id", cosmeticId)
    .single();

  if (existing) {
    return { success: false, error: "Déjà possédé" };
  }

  // Get user's current balance
  const { data: user, error: userError } = await supabase()
    .from("users")
    .select("coins, gems, level")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return { success: false, error: "Utilisateur introuvable" };
  }

  // Check unlock requirements
  const unlockType = cosmetic.unlock_type as string;
  const unlockValue = cosmetic.unlock_value as number;

  if (unlockType === "level" && user.level < unlockValue) {
    return { success: false, error: `Niveau ${unlockValue} requis` };
  }

  if (unlockType === "coins" && user.coins < unlockValue) {
    return { success: false, error: "Pas assez de pièces" };
  }

  if (unlockType === "gems" && user.gems < unlockValue) {
    return { success: false, error: "Pas assez de gemmes" };
  }

  // Deduct currency if needed
  if (unlockType === "coins") {
    const { error } = await supabase()
      .from("users")
      .update({ coins: user.coins - unlockValue })
      .eq("id", userId);
    if (error) return { success: false, error: "Erreur de paiement" };
  } else if (unlockType === "gems") {
    const { error } = await supabase()
      .from("users")
      .update({ gems: user.gems - unlockValue })
      .eq("id", userId);
    if (error) return { success: false, error: "Erreur de paiement" };
  }

  // Add to user_cosmetics
  const { error: insertError } = await supabase()
    .from("user_cosmetics")
    .insert({
      user_id: userId,
      cosmetic_id: cosmeticId,
      is_equipped: false,
    });

  if (insertError) {
    return { success: false, error: "Erreur lors de l'achat" };
  }

  return { success: true };
}

// Get user's equipped cosmetics
export async function getUserEquippedCosmetics(userId: string) {
  const { data, error } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id, cosmetics(*)")
    .eq("user_id", userId)
    .eq("is_equipped", true);
  if (error) throw error;

  const result: Record<string, Tables["cosmetics"]["Row"]> = {};
  (data ?? []).forEach((uc) => {
    const cosmetic = uc.cosmetics as unknown as Tables["cosmetics"]["Row"];
    if (cosmetic) {
      result[cosmetic.type] = cosmetic;
    }
  });
  return result;
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

// ==========================================
// Bible Reader Queries
// ==========================================

// Get all Bible books with metadata, ordered canonically
export async function getBibleBooks() {
  const { data, error } = await supabase()
    .from("bible_books")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return data as Tables["bible_books"]["Row"][];
}

// Get books filtered by testament
export async function getBooksByTestament(testament: "old" | "new") {
  const { data, error } = await supabase()
    .from("bible_books")
    .select("*")
    .eq("testament", testament)
    .order("order_index");
  if (error) throw error;
  return data as Tables["bible_books"]["Row"][];
}

// Get a single book by name
export async function getBibleBook(bookName: string) {
  const { data, error } = await supabase()
    .from("bible_books")
    .select("*")
    .eq("name", bookName)
    .single();
  if (error) throw error;
  return data as Tables["bible_books"]["Row"];
}

// Get all verses for a specific chapter
export async function getChapter(
  book: string,
  chapter: number,
  translation: string = "LSG"
) {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("translation", translation)
    .order("verse");
  if (error) throw error;
  return data as Tables["bible_verses"]["Row"][];
}

// Get verse count for a chapter
export async function getVerseCount(book: string, chapter: number) {
  const { count, error } = await supabase()
    .from("bible_verses")
    .select("*", { count: "exact", head: true })
    .eq("book", book)
    .eq("chapter", chapter);
  if (error) throw error;
  return count ?? 0;
}

// Get a single verse
export async function getVerse(book: string, chapter: number, verse: number) {
  const { data, error } = await supabase()
    .from("bible_verses")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("verse", verse)
    .single();
  if (error) throw error;
  return data as Tables["bible_verses"]["Row"];
}

// ==========================================
// Full-Text Search for Bible Verses
// ==========================================

// Search verses using PostgreSQL Full-Text Search (French config)
export async function searchVersesFTS(query: string, limit: number = 50) {
  // Convert query to tsquery format: split words and join with &
  const tsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[^a-zA-ZÀ-ÿ0-9]/g, ""))
    .filter(Boolean)
    .join(" & ");

  if (!tsQuery) {
    return [];
  }

  const { data, error } = await supabase()
    .from("bible_verses")
    .select("*")
    .textSearch("text_search_vector", tsQuery, { config: "french" })
    .limit(limit);

  if (error) throw error;
  return data as Tables["bible_verses"]["Row"][];
}

// ==========================================
// User Favorites with Notes
// ==========================================

// Get user's favorite verses with notes
export async function getUserFavoritesWithNotes(userId: string) {
  const { data, error } = await supabase()
    .from("user_verses")
    .select("verse_id, created_at, note, bible_verses(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((uv) => {
    const verse = uv.bible_verses as unknown as Tables["bible_verses"]["Row"];
    return {
      ...verse,
      favorited_at: uv.created_at,
      note: uv.note,
    };
  });
}

// Update or delete a note on a favorite verse
export async function updateVerseNote(
  userId: string,
  verseId: string,
  note: string | null
) {
  const { error } = await supabase()
    .from("user_verses")
    .update({ note })
    .eq("user_id", userId)
    .eq("verse_id", verseId);
  if (error) throw error;
}

// ==========================================
// Verse Notes
// ==========================================

// Get note for a specific verse
export async function getVerseNote(userId: string, verseId: string) {
  const { data, error } = await supabase()
    .from("verse_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as Tables["verse_notes"]["Row"] | null;
}

// Get all notes for verses in a chapter (for bulk loading)
export async function getChapterNotes(userId: string, verseIds: string[]) {
  if (verseIds.length === 0) return new Map<string, string>();
  const { data, error } = await supabase()
    .from("verse_notes")
    .select("verse_id, content")
    .eq("user_id", userId)
    .in("verse_id", verseIds);
  if (error) throw error;
  const map = new Map<string, string>();
  (data ?? []).forEach((n) => map.set(n.verse_id, n.content));
  return map;
}

// Save or update a note
export async function saveVerseNote(
  userId: string,
  verseId: string,
  content: string
) {
  const { error } = await supabase()
    .from("verse_notes")
    .upsert(
      {
        user_id: userId,
        verse_id: verseId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,verse_id" }
    );
  if (error) throw error;
}

// Delete a note
export async function deleteVerseNote(userId: string, verseId: string) {
  const { error } = await supabase()
    .from("verse_notes")
    .delete()
    .eq("user_id", userId)
    .eq("verse_id", verseId);
  if (error) throw error;
}

// ==========================================
// Verse Cross-References
// ==========================================

// Get all references for a source verse
export async function getVerseReferences(userId: string, sourceVerseId: string) {
  const { data, error } = await supabase()
    .from("verse_references")
    .select("id, target_verse_id, bible_verses!verse_references_target_verse_id_fkey(*)")
    .eq("user_id", userId)
    .eq("source_verse_id", sourceVerseId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    targetVerse: r.bible_verses as unknown as Tables["bible_verses"]["Row"],
  }));
}

// Get reference counts for all verses in a chapter (for showing indicator)
export async function getChapterReferenceCounts(userId: string, verseIds: string[]) {
  if (verseIds.length === 0) return new Map<string, number>();
  const { data, error } = await supabase()
    .from("verse_references")
    .select("source_verse_id")
    .eq("user_id", userId)
    .in("source_verse_id", verseIds);
  if (error) throw error;
  const map = new Map<string, number>();
  (data ?? []).forEach((r) => {
    map.set(r.source_verse_id, (map.get(r.source_verse_id) ?? 0) + 1);
  });
  return map;
}

// Add a cross-reference
export async function addVerseReference(
  userId: string,
  sourceVerseId: string,
  targetVerseId: string
) {
  const { error } = await supabase()
    .from("verse_references")
    .insert({
      user_id: userId,
      source_verse_id: sourceVerseId,
      target_verse_id: targetVerseId,
    });
  if (error) throw error;
}

// Remove a cross-reference
export async function removeVerseReference(userId: string, referenceId: string) {
  const { error } = await supabase()
    .from("verse_references")
    .delete()
    .eq("user_id", userId)
    .eq("id", referenceId);
  if (error) throw error;
}

// Search verses for reference picker (by book/chapter/verse or text)
export async function searchVersesForReference(
  query: string,
  limit: number = 10
) {
  // Try to parse as reference (e.g., "Jean 3:16" or "Ephésiens 5:23")
  const refMatch = query.match(/^(.+?)\s*(\d+):(\d+)$/);
  if (refMatch) {
    const [, bookName, chapter, verse] = refMatch;
    const { data, error } = await supabase()
      .from("bible_verses")
      .select("*")
      .ilike("book", `%${bookName.trim()}%`)
      .eq("chapter", parseInt(chapter))
      .eq("verse", parseInt(verse))
      .limit(limit);
    if (error) throw error;
    return data as Tables["bible_verses"]["Row"][];
  }
  // Fall back to text search
  return searchVersesFTS(query, limit);
}

// ==========================================
// Mastery Paths Queries
// ==========================================

// Get all published mastery paths
export async function getMasteryPaths() {
  const { data, error } = await supabase()
    .from("mastery_paths")
    .select("*")
    .eq("is_published", true)
    .order("order_index");
  if (error) throw error;
  return data as Tables["mastery_paths"]["Row"][];
}

// Get a single mastery path by slug
export async function getMasteryPathBySlug(slug: string) {
  const { data, error } = await supabase()
    .from("mastery_paths")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) throw error;
  return data as Tables["mastery_paths"]["Row"];
}

// Get all milestones for a path
export async function getPathMilestones(pathId: string) {
  const { data, error } = await supabase()
    .from("path_milestones")
    .select("*")
    .eq("path_id", pathId)
    .order("order_index");
  if (error) throw error;
  return data as Tables["path_milestones"]["Row"][];
}

// Get a single milestone by ID
export async function getMilestone(milestoneId: string) {
  const { data, error } = await supabase()
    .from("path_milestones")
    .select("*")
    .eq("id", milestoneId)
    .single();
  if (error) throw error;
  return data as Tables["path_milestones"]["Row"];
}

// Get questions for a milestone
export async function getMilestoneQuestions(milestoneId: string) {
  const { data, error } = await supabase()
    .from("milestone_questions")
    .select("*")
    .eq("milestone_id", milestoneId)
    .order("order_index");
  if (error) throw error;
  return data as Tables["milestone_questions"]["Row"][];
}

// Get user's progress on all paths
export async function getUserPathsProgress(userId: string) {
  const { data, error } = await supabase()
    .from("user_path_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data as Tables["user_path_progress"]["Row"][];
}

// Get user's progress on a specific path
export async function getUserPathProgress(userId: string, pathId: string) {
  const { data, error } = await supabase()
    .from("user_path_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("path_id", pathId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as Tables["user_path_progress"]["Row"] | null;
}

// Get user's milestone progress for a path
export async function getUserMilestonesProgress(userId: string, milestoneIds: string[]) {
  if (milestoneIds.length === 0) return [];
  const { data, error } = await supabase()
    .from("user_milestone_progress")
    .select("*")
    .eq("user_id", userId)
    .in("milestone_id", milestoneIds);
  if (error) throw error;
  return data as Tables["user_milestone_progress"]["Row"][];
}

// Start a path (create path progress record)
export async function startPath(userId: string, pathId: string) {
  const { error } = await supabase()
    .from("user_path_progress")
    .upsert(
      {
        user_id: userId,
        path_id: pathId,
        started_at: new Date().toISOString(),
        current_milestone_index: 0,
      },
      { onConflict: "user_id,path_id" }
    );
  if (error) throw error;
}

// Save milestone progress
export async function saveMilestoneProgress(
  userId: string,
  milestoneId: string,
  score: number,
  completed: boolean
) {
  const { error } = await supabase()
    .from("user_milestone_progress")
    .upsert(
      {
        user_id: userId,
        milestone_id: milestoneId,
        completed,
        best_score: score,
        attempts: 1,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,milestone_id" }
    );
  if (error) throw error;
}

// Update path progress (current milestone index)
export async function updatePathProgress(
  userId: string,
  pathId: string,
  currentMilestoneIndex: number,
  completed: boolean = false
) {
  const { error } = await supabase()
    .from("user_path_progress")
    .update({
      current_milestone_index: currentMilestoneIndex,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("user_id", userId)
    .eq("path_id", pathId);
  if (error) throw error;
}

// Get mastery path with full progress data
export async function getMasteryPathWithProgress(
  slug: string,
  userId?: string | null
) {
  // Get path
  const path = await getMasteryPathBySlug(slug);

  // Get milestones
  const milestones = await getPathMilestones(path.id);

  // Get user progress if logged in
  let pathProgress: Tables["user_path_progress"]["Row"] | null = null;
  const milestoneProgressMap: Record<string, Tables["user_milestone_progress"]["Row"]> = {};

  if (userId) {
    pathProgress = await getUserPathProgress(userId, path.id);

    const milestoneIds = milestones.map((m) => m.id);
    const milestoneProgress = await getUserMilestonesProgress(userId, milestoneIds);
    milestoneProgress.forEach((mp) => {
      milestoneProgressMap[mp.milestone_id] = mp;
    });
  }

  // Calculate overall progress
  const completedMilestones = milestones.filter(
    (m) => milestoneProgressMap[m.id]?.completed
  ).length;
  const overallProgress = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0;

  return {
    path,
    milestones: milestones.map((m, index) => {
      const progress = milestoneProgressMap[m.id];
      // Milestone is unlocked if: first one, OR previous is completed
      const isUnlocked = index === 0 || milestoneProgressMap[milestones[index - 1]?.id]?.completed;
      return {
        ...m,
        completed: progress?.completed ?? false,
        bestScore: progress?.best_score ?? 0,
        attempts: progress?.attempts ?? 0,
        isUnlocked,
      };
    }),
    pathProgress,
    overallProgress,
    completedMilestones,
    totalMilestones: milestones.length,
  };
}

// Get all mastery paths with user progress summary
export async function getMasteryPathsWithProgress(userId?: string | null) {
  const paths = await getMasteryPaths();

  // Create a map of path id to path name for prerequisite lookup
  const pathNameMap: Record<string, string | undefined> = {};
  paths.forEach((p) => {
    pathNameMap[p.id] = p.name;
  });

  const pathIds = paths.map((p) => p.id);

  // Batch load all milestones for all paths in ONE query (fixes N+1 problem)
  const { data: allMilestones } = await supabase()
    .from("path_milestones")
    .select("id, path_id")
    .in("path_id", pathIds);

  // Group milestones by path_id
  const milestonesByPath: Record<string, string[]> = {};
  const allMilestoneIds: string[] = [];
  allMilestones?.forEach((m) => {
    if (!milestonesByPath[m.path_id]) milestonesByPath[m.path_id] = [];
    milestonesByPath[m.path_id].push(m.id);
    allMilestoneIds.push(m.id);
  });

  if (!userId) {
    // For guests, paths with prerequisites are locked
    return paths.map((p) => ({
      ...p,
      started: false,
      completed: false,
      progress: 0,
      completedMilestones: 0,
      totalMilestones: milestonesByPath[p.id]?.length || 0,
      isLocked: !!p.required_path_id,
      requiredPathName: p.required_path_id ? pathNameMap[p.required_path_id] : undefined,
    }));
  }

  // Get all user path progress in ONE query
  const userProgress = await getUserPathsProgress(userId);
  const progressMap: Record<string, Tables["user_path_progress"]["Row"]> = {};
  userProgress.forEach((up) => {
    progressMap[up.path_id] = up;
  });

  // Get all milestone progress in ONE query (fixes N+1 problem)
  const allMilestoneProgress = allMilestoneIds.length > 0
    ? await getUserMilestonesProgress(userId, allMilestoneIds)
    : [];

  // Create a set of completed milestone IDs for fast lookup
  const completedMilestoneIds = new Set(
    allMilestoneProgress.filter((mp) => mp.completed).map((mp) => mp.milestone_id)
  );

  // Build paths with progress using pre-loaded data
  const pathsWithProgress = paths.map((path) => {
    const pathMilestoneIds = milestonesByPath[path.id] || [];
    const totalMilestones = pathMilestoneIds.length;
    const completedMilestones = pathMilestoneIds.filter((id) => completedMilestoneIds.has(id)).length;

    const progress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    const pathProg = progressMap[path.id];

    // Check if prerequisite path is completed
    let isLocked = false;
    let requiredPathName: string | undefined;
    if (path.required_path_id) {
      const requiredPathProgress = progressMap[path.required_path_id];
      isLocked = !requiredPathProgress?.completed_at;
      requiredPathName = pathNameMap[path.required_path_id];
    }

    return {
      ...path,
      started: !!pathProg,
      completed: !!pathProg?.completed_at,
      progress,
      completedMilestones,
      totalMilestones,
      isLocked,
      requiredPathName,
    };
  });

  return pathsWithProgress;
}

// ============================================
// READING GROUPS
// ============================================

// Get all groups for a user
export async function getUserGroups(userId: string) {
  const { data, error } = await supabase()
    .from("group_members")
    .select(`
      role,
      joined_at,
      reading_groups (
        id,
        name,
        description,
        cover_color,
        creator_id,
        invite_code,
        max_members,
        is_public,
        created_at
      )
    `)
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

// Get a single group with members and active challenges
export async function getGroupDetails(groupId: string) {
  const { data: group, error: groupError } = await supabase()
    .from("reading_groups")
    .select("*")
    .eq("id", groupId)
    .single();
  if (groupError) throw groupError;

  const { data: members, error: membersError } = await supabase()
    .from("group_members")
    .select(`
      id,
      role,
      joined_at,
      user_id,
      users (
        id,
        username,
        avatar_url,
        xp,
        level
      )
    `)
    .eq("group_id", groupId)
    .order("role", { ascending: true });
  if (membersError) throw membersError;

  const { data: challenges, error: challengesError } = await supabase()
    .from("reading_challenges")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .order("deadline", { ascending: true });
  if (challengesError) throw challengesError;

  return { group, members, challenges };
}

// Get group by invite code
export async function getGroupByInviteCode(inviteCode: string) {
  const { data, error } = await supabase()
    .from("reading_groups")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();
  if (error) throw error;
  return data;
}

// Create a new group
export async function createGroup(
  name: string,
  creatorId: string,
  description?: string,
  coverColor?: string
) {
  const { data, error } = await supabase()
    .from("reading_groups")
    .insert({
      name,
      creator_id: creatorId,
      description,
      cover_color: coverColor || "#6366F1",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Join a group
export async function joinGroup(groupId: string, userId: string) {
  const { data, error } = await supabase()
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Leave a group
export async function leaveGroup(groupId: string, userId: string) {
  const { error } = await supabase()
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

// Get members count for a group
export async function getGroupMembersCount(groupId: string) {
  const { count, error } = await supabase()
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  if (error) throw error;
  return count || 0;
}

// ============================================
// READING CHALLENGES
// ============================================

// Create a reading challenge
export async function createChallenge(
  groupId: string,
  createdBy: string,
  data: {
    title: string;
    description?: string;
    bookName: string;
    chapterStart: number;
    verseStart?: number;
    chapterEnd?: number;
    verseEnd?: number;
    deadline: string;
  }
) {
  const { data: challenge, error } = await supabase()
    .from("reading_challenges")
    .insert({
      group_id: groupId,
      created_by: createdBy,
      title: data.title,
      description: data.description,
      book_name: data.bookName,
      chapter_start: data.chapterStart,
      verse_start: data.verseStart || 1,
      chapter_end: data.chapterEnd,
      verse_end: data.verseEnd,
      deadline: data.deadline,
    })
    .select()
    .single();
  if (error) throw error;
  return challenge;
}

// Get challenge with progress for all members
export async function getChallengeWithProgress(challengeId: string) {
  const { data: challenge, error: challengeError } = await supabase()
    .from("reading_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (challengeError) throw challengeError;

  const { data: progress, error: progressError } = await supabase()
    .from("challenge_progress")
    .select(`
      id,
      user_id,
      completed,
      completed_at,
      notes,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq("challenge_id", challengeId);
  if (progressError) throw progressError;

  return { challenge, progress };
}

// Mark challenge as completed for user
export async function markChallengeCompleted(
  challengeId: string,
  userId: string,
  notes?: string
) {
  const { data, error } = await supabase()
    .from("challenge_progress")
    .upsert({
      challenge_id: challengeId,
      user_id: userId,
      completed: true,
      completed_at: new Date().toISOString(),
      notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get active challenges for a user (across all groups)
export async function getUserActiveChallenges(userId: string) {
  // Get user's groups first
  const { data: memberships, error: memberError } = await supabase()
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  if (memberError) throw memberError;

  const groupIds = memberships?.map((m) => m.group_id) || [];
  if (groupIds.length === 0) return [];

  // Get active challenges from those groups
  const { data: challenges, error: challengeError } = await supabase()
    .from("reading_challenges")
    .select(`
      *,
      reading_groups (
        id,
        name,
        cover_color
      )
    `)
    .in("group_id", groupIds)
    .eq("status", "active")
    .gte("deadline", new Date().toISOString())
    .order("deadline", { ascending: true });
  if (challengeError) throw challengeError;

  // Get user's progress on these challenges
  const challengeIds = challenges?.map((c) => c.id) || [];
  if (challengeIds.length === 0) return challenges;

  const { data: progress, error: progressError } = await supabase()
    .from("challenge_progress")
    .select("challenge_id, completed, completed_at")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds);
  if (progressError) throw progressError;

  const progressMap: Record<string, { completed: boolean; completed_at: string | null }> = {};
  progress?.forEach((p) => {
    progressMap[p.challenge_id] = { completed: p.completed, completed_at: p.completed_at };
  });

  return challenges?.map((c) => ({
    ...c,
    userProgress: progressMap[c.id] || { completed: false, completed_at: null },
  }));
}
