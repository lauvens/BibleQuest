"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerseCard } from "@/components/verses/verse-card";
import { VerseSearch } from "@/components/verses/verse-search";
import { VerseFilters } from "@/components/verses/verse-filters";
import { useUserStore } from "@/lib/store/user-store";
import {
  getAllVerses,
  searchVerses,
  getVersesByBook,
  getUniqueBooks,
  getUserFavorites,
  getUserFavoriteIds,
  toggleFavorite,
} from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];

export default function VersetsPage() {
  const { isGuest, id: userId } = useUserStore();

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [booksData, favIds] = await Promise.all([
        getUniqueBooks(),
        userId && !isGuest ? getUserFavoriteIds(userId) : Promise.resolve(new Set<string>()),
      ]);
      setBooks(booksData);
      setFavoriteIds(favIds);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest]);

  // Load verses based on filters
  const loadVerses = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let data: BibleVerse[];

      if (showFavoritesOnly && userId && !isGuest) {
        // Load favorites
        const favorites = await getUserFavorites(userId);
        data = favorites;
      } else if (searchQuery) {
        // Search verses
        data = await searchVerses(searchQuery);
      } else if (selectedBook) {
        // Filter by book
        data = await getVersesByBook(selectedBook);
      } else {
        // Load all verses
        const result = await getAllVerses(100);
        data = result.verses;
      }

      setVerses(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedBook, showFavoritesOnly, userId, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Clear other filters when searching
    if (query) {
      setSelectedBook("");
      setShowFavoritesOnly(false);
    }
  }, []);

  const handleBookChange = useCallback((book: string) => {
    setSelectedBook(book);
    setSearchQuery("");
    setShowFavoritesOnly(false);
  }, []);

  const handleFavoritesToggle = useCallback((show: boolean) => {
    setShowFavoritesOnly(show);
    setSearchQuery("");
    setSelectedBook("");
  }, []);

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

      // If showing favorites only and we unfavorited, remove from list
      if (showFavoritesOnly && !isFav) {
        setVerses((prev) => prev.filter((v) => v.id !== verseId));
      }
    } catch {
      // Silently fail - could add toast notification here
    }
  }, [userId, isGuest, showFavoritesOnly]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-info-100 dark:bg-info-900/40 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-info-600 dark:text-info-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
            Bibliotheque de Versets
          </h1>
          <p className="text-primary-500 dark:text-primary-400">
            Explorez et sauvegardez vos versets preferes
          </p>
        </div>
      </div>

      {/* Search */}
      <VerseSearch
        onSearch={handleSearch}
        className="mb-4"
      />

      {/* Filters */}
      <VerseFilters
        books={books}
        selectedBook={selectedBook}
        onBookChange={handleBookChange}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesToggle={handleFavoritesToggle}
        isGuest={isGuest}
        className="mb-6"
      />

      {/* Guest Message */}
      {isGuest && (
        <Card className="mb-6 border-olive-200 bg-olive-50/50 dark:border-olive-800 dark:bg-olive-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-olive-600 dark:text-olive-400 flex-shrink-0" />
            <p className="text-sm text-primary-600 dark:text-primary-300">
              Connectez-vous pour sauvegarder vos versets favoris et y acceder depuis tous vos appareils.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="p-6 text-center">
            <p className="text-error-600 dark:text-error-400 mb-4">
              Une erreur est survenue lors du chargement des versets.
            </p>
            <Button onClick={loadVerses} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 w-20 bg-parchment-300 dark:bg-primary-700 rounded-full mb-3" />
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-parchment-300 dark:bg-primary-700 rounded" />
                  <div className="h-4 bg-parchment-300 dark:bg-primary-700 rounded w-5/6" />
                  <div className="h-4 bg-parchment-300 dark:bg-primary-700 rounded w-4/6" />
                </div>
                <div className="h-4 w-24 bg-parchment-300 dark:bg-primary-700 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-parchment-300 dark:bg-primary-700 rounded" />
                  <div className="h-8 w-8 bg-parchment-300 dark:bg-primary-700 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && verses.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-parchment-200 dark:bg-primary-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              {showFavoritesOnly
                ? "Aucun favori"
                : searchQuery
                  ? "Aucun resultat"
                  : "Aucun verset trouve"}
            </h3>
            <p className="text-primary-500 dark:text-primary-400">
              {showFavoritesOnly
                ? "Ajoutez des versets a vos favoris en cliquant sur le coeur."
                : searchQuery
                  ? "Essayez avec d'autres mots-cles."
                  : "Revenez bientot pour decouvrir de nouveaux versets."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verses Grid */}
      {!loading && !error && verses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verses.map((verse) => (
            <VerseCard
              key={verse.id}
              id={verse.id}
              book={verse.book}
              chapter={verse.chapter}
              verse={verse.verse}
              text={verse.text}
              isFavorite={favoriteIds.has(verse.id)}
              isGuest={isGuest}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && verses.length > 0 && (
        <p className="text-center text-sm text-primary-400 dark:text-primary-500 mt-6">
          {verses.length} verset{verses.length > 1 ? "s" : ""} affiche{verses.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
