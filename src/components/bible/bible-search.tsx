"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchVersesFTS } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];

interface BibleSearchProps {
  className?: string;
}

export function BibleSearch({ className }: BibleSearchProps) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchVersesFTS(query, 10);
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value.trim());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setValue("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleResultClick = () => {
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-primary-400" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Rechercher dans la Bible..."
          className="input pl-12 pr-10"
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600 transition-colors"
            title="Effacer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-primary-800 border border-parchment-200 dark:border-primary-700 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-primary-500">
              <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-primary-500 dark:text-primary-400">
              Aucun resultat trouve
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((verse) => (
                  <li key={verse.id}>
                    <Link
                      href={`/bible/${encodeURIComponent(verse.book)}/${verse.chapter}#verse-${verse.verse}`}
                      onClick={handleResultClick}
                      className="block p-3 hover:bg-parchment-50 dark:hover:bg-primary-700 transition-colors border-b border-parchment-100 dark:border-primary-700 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-1">
                            {verse.book} {verse.chapter}:{verse.verse}
                          </p>
                          <p className="text-sm text-primary-700 dark:text-parchment-200 line-clamp-2">
                            {verse.text}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* See All Results Link */}
              <Link
                href={`/versets?search=${encodeURIComponent(value)}`}
                onClick={handleResultClick}
                className="flex items-center justify-center gap-2 p-3 bg-parchment-50 dark:bg-primary-750 hover:bg-parchment-100 dark:hover:bg-primary-700 transition-colors text-sm font-medium text-gold-600 dark:text-gold-400"
              >
                Voir tous les resultats
                <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
