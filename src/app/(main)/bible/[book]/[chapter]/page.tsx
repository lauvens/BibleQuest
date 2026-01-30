"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerseList } from "@/components/bible/verse-list";
import { ChapterNav } from "@/components/bible/chapter-nav";
import { useUserStore } from "@/lib/store/user-store";
import { getChapter, getBibleBook, getUserFavoriteIds, toggleFavorite } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];
type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];

export default function ChapterPage() {
  const params = useParams();
  const bookName = decodeURIComponent(params.book as string);
  const chapterNum = parseInt(params.chapter as string, 10);

  const { isGuest, id: userId } = useUserStore();

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [versesData, bookData, favIds] = await Promise.all([
        getChapter(bookName, chapterNum),
        getBibleBook(bookName),
        userId && !isGuest ? getUserFavoriteIds(userId) : Promise.resolve(new Set<string>()),
      ]);
      setVerses(versesData);
      setBook(bookData);
      setFavoriteIds(favIds);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bookName, chapterNum, userId, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleFavorite = useCallback(async (verseId: string) => {
    if (!userId || isGuest) return;
    try {
      const isFav = await toggleFavorite(userId, verseId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(verseId);
        } else {
          next.delete(verseId);
        }
        return next;
      });
    } catch {
      // Silently fail
    }
  }, [userId, isGuest]);

  const testamentColors = book?.testament === "old"
    ? "bg-olive-100 dark:bg-olive-900/40 text-olive-700 dark:text-olive-300"
    : "bg-info-100 dark:bg-info-900/40 text-info-700 dark:text-info-300";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/bible/${encodeURIComponent(bookName)}`}
        className="inline-flex items-center text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {bookName}
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-parchment-300 dark:bg-primary-700" />
            <div>
              <div className="h-7 w-48 bg-parchment-300 dark:bg-primary-700 rounded mb-2" />
              <div className="h-5 w-32 bg-parchment-300 dark:bg-primary-700 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-parchment-300 dark:bg-primary-700 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="p-6 text-center">
            <p className="text-error-600 dark:text-error-400 mb-4">
              Impossible de charger {bookName} {chapterNum}.
            </p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chapter Content */}
      {!loading && !error && book && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${testamentColors}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
                {bookName} {chapterNum}
              </h1>
              <p className="text-primary-500 dark:text-primary-400">
                {verses.length} verset{verses.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Chapter Navigation - Top */}
          <ChapterNav
            bookName={bookName}
            currentChapter={chapterNum}
            totalChapters={book.chapters}
          />

          {/* Verses */}
          <Card className="mt-6">
            <CardContent className="p-6">
              {verses.length > 0 ? (
                <VerseList
                  verses={verses}
                  favoriteIds={favoriteIds}
                  isGuest={isGuest}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <p className="text-center text-primary-500 dark:text-primary-400 py-8">
                  Aucun verset trouve pour ce chapitre.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Chapter Navigation - Bottom */}
          <div className="mt-6">
            <ChapterNav
              bookName={bookName}
              currentChapter={chapterNum}
              totalChapters={book.chapters}
            />
          </div>
        </>
      )}
    </div>
  );
}
