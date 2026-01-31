"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Copy, Check, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VerseCardProps {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  isFavorite?: boolean;
  isGuest?: boolean;
  onToggleFavorite?: (verseId: string) => void;
}

export function VerseCard({
  id,
  book,
  chapter,
  verse,
  text,
  isFavorite = false,
  isGuest = false,
  onToggleFavorite,
}: VerseCardProps) {
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const reference = `${book} ${chapter}:${verse}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${text}" - ${reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = `"${text}" - ${reference}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavorite = () => {
    if (isGuest || !onToggleFavorite) return;
    setAnimating(true);
    onToggleFavorite(id);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Book Badge */}
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-400">
            {book}
          </span>
        </div>

        {/* Verse Text */}
        <p className="verse-text flex-1 mb-3">
          &quot;{text}&quot;
        </p>

        {/* Reference */}
        <p className="verse-reference mb-4">
          {reference}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            disabled={isGuest}
            title={isGuest ? "Connectez-vous pour sauvegarder" : isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "p-2",
              isFavorite ? "text-error-500 hover:text-error-600" : "text-primary-400 hover:text-primary-600"
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-transform",
                isFavorite && "fill-current",
                animating && "scale-125"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Copier le verset"
            className="p-2 text-primary-400 hover:text-primary-600"
          >
            {copied ? (
              <Check className="w-5 h-5 text-success-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>

          <Link
            href={`/bible/${encodeURIComponent(book)}/${chapter}`}
            title="Lire en contexte"
            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-parchment-100 dark:hover:bg-primary-800 rounded-md transition-colors"
          >
            <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
