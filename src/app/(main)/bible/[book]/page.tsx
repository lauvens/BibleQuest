"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChapterGrid } from "@/components/bible/chapter-grid";
import { getBibleBook } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];

export default function BookPage() {
  const params = useParams();
  const bookName = decodeURIComponent(params.book as string);

  const [book, setBook] = useState<BibleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBibleBook(bookName);
      setBook(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bookName]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const testamentColors = book?.testament === "old"
    ? "bg-olive-100 dark:bg-olive-900/40 text-olive-700 dark:text-olive-300"
    : "bg-info-100 dark:bg-info-900/40 text-info-700 dark:text-info-300";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/bible"
        className="inline-flex items-center text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Retour aux livres
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-parchment-300 dark:bg-primary-700" />
            <div>
              <div className="h-7 w-40 bg-parchment-300 dark:bg-primary-700 rounded mb-2" />
              <div className="h-5 w-24 bg-parchment-300 dark:bg-primary-700 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-square bg-parchment-300 dark:bg-primary-700 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="p-6 text-center">
            <p className="text-error-600 dark:text-error-400 mb-4">
              Impossible de charger le livre &quot;{bookName}&quot;.
            </p>
            <Button onClick={loadBook} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Book Content */}
      {!loading && !error && book && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${testamentColors}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
                {book.name}
              </h1>
              <p className="text-primary-500 dark:text-primary-400">
                {book.chapters} chapitre{book.chapters > 1 ? "s" : ""} &bull;{" "}
                {book.testament === "old" ? "Ancien Testament" : "Nouveau Testament"}
              </p>
            </div>
          </div>

          {/* Chapter Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
                Choisir un chapitre
              </h2>
              <ChapterGrid bookName={book.name} totalChapters={book.chapters} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
