"use client";

import { Heart, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];

interface VerseListProps {
  verses: BibleVerse[];
  favoriteIds: Set<string>;
  isGuest: boolean;
  onToggleFavorite: (verseId: string) => void;
}

export function VerseList({ verses, favoriteIds, isGuest, onToggleFavorite }: VerseListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(verse.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-1">
      {verses.map((verse) => (
        <div
          key={verse.id}
          id={`verse-${verse.verse}`}
          className="group flex gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-parchment-100 dark:hover:bg-primary-800/50 transition-colors"
        >
          <span className="text-xs font-semibold text-gold-600 dark:text-gold-500 mt-1 min-w-[1.5rem]">
            {verse.verse}
          </span>
          <p className="flex-1 verse-text text-primary-700 dark:text-parchment-100">
            {verse.text}
          </p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isGuest && (
              <button
                onClick={() => onToggleFavorite(verse.id)}
                className="p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
                aria-label={favoriteIds.has(verse.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart
                  className={`w-4 h-4 ${
                    favoriteIds.has(verse.id)
                      ? "fill-error-500 text-error-500"
                      : "text-primary-400"
                  }`}
                />
              </button>
            )}
            <button
              onClick={() => handleCopy(verse)}
              className="p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
              aria-label="Copier le verset"
            >
              {copiedId === verse.id ? (
                <Check className="w-4 h-4 text-success-500" />
              ) : (
                <Copy className="w-4 h-4 text-primary-400" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
