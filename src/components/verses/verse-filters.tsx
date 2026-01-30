"use client";

import { ChevronDown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseFiltersProps {
  books: string[];
  selectedBook: string;
  onBookChange: (book: string) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (show: boolean) => void;
  isGuest: boolean;
  className?: string;
}

export function VerseFilters({
  books,
  selectedBook,
  onBookChange,
  showFavoritesOnly,
  onFavoritesToggle,
  isGuest,
  className,
}: VerseFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Book Select */}
      <div className="relative">
        <select
          value={selectedBook}
          onChange={(e) => onBookChange(e.target.value)}
          className="appearance-none input pr-10 py-2.5 min-w-[160px] cursor-pointer"
        >
          <option value="">Tous les livres</option>
          {books.map((book) => (
            <option key={book} value={book}>
              {book}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="w-5 h-5 text-primary-400" />
        </div>
      </div>

      {/* Favorites Toggle */}
      {!isGuest && (
        <button
          onClick={() => onFavoritesToggle(!showFavoritesOnly)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border-2",
            showFavoritesOnly
              ? "bg-error-50 border-error-200 text-error-600 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400"
              : "bg-parchment-50 border-parchment-300 text-primary-600 hover:border-primary-400 dark:bg-primary-800 dark:border-primary-700 dark:text-primary-300 dark:hover:border-primary-500"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              showFavoritesOnly && "fill-current"
            )}
          />
          <span>Mes favoris</span>
        </button>
      )}
    </div>
  );
}
