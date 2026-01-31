"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/bible/book-card";
import { TestamentTabs } from "@/components/bible/testament-tabs";
import { getBibleBooks } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];

export default function BiblePage() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTestament, setActiveTestament] = useState<"old" | "new">("old");

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBibleBooks();
      setBooks(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const filteredBooks = books.filter((book) => book.testament === activeTestament);
  const oldCount = books.filter((b) => b.testament === "old").length;
  const newCount = books.filter((b) => b.testament === "new").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gold-600 dark:text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
              La Bible
            </h1>
            <p className="text-primary-500 dark:text-primary-400">
              Louis Segond 1910
            </p>
          </div>
        </div>
        <Link href="/versets">
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Mes versets</span>
          </Button>
        </Link>
      </div>

      {/* Testament Tabs */}
      <TestamentTabs
        activeTestament={activeTestament}
        onTabChange={setActiveTestament}
        oldCount={oldCount}
        newCount={newCount}
      />

      {/* Error State */}
      {error && (
        <Card className="mt-6 border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="p-6 text-center">
            <p className="text-error-600 dark:text-error-400 mb-4">
              Une erreur est survenue lors du chargement.
            </p>
            <Button onClick={loadBooks} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-12 bg-parchment-300 dark:bg-primary-700 rounded-full mb-2" />
                <div className="h-5 w-24 bg-parchment-300 dark:bg-primary-700 rounded mb-1" />
                <div className="h-4 w-16 bg-parchment-300 dark:bg-primary-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              name={book.name}
              abbreviation={book.abbreviation}
              chapters={book.chapters}
              testament={book.testament}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBooks.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-parchment-200 dark:bg-primary-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              Aucun livre trouve
            </h3>
            <p className="text-primary-500 dark:text-primary-400">
              Les livres de la Bible n&apos;ont pas encore ete charges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
