"use client";

import Link from "next/link";
import { Book, Share2 } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

interface DailyVerseSectionProps {
  verse: {
    text: string;
    reference: string;
  } | null;
}

const defaultVerse = {
  text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
  reference: "Psaume 119:105",
};

export function DailyVerseSection({ verse }: DailyVerseSectionProps) {
  const displayVerse = verse || defaultVerse;

  const handleShare = async () => {
    const text = `"${displayVerse.text}" — ${displayVerse.reference}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <FadeIn delay={0.3} className="mb-12">
      <div className="text-center py-12 px-6 rounded-3xl bg-parchment-100 dark:bg-primary-850 border border-parchment-300 dark:border-primary-700">
        <p className="text-xs uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-4">
          Verset du jour
        </p>
        <blockquote className="text-xl md:text-2xl font-serif italic text-primary-800 dark:text-parchment-50 max-w-2xl mx-auto mb-4 leading-relaxed">
          &ldquo;{displayVerse.text}&rdquo;
        </blockquote>
        <cite className="text-primary-500 dark:text-primary-400 not-italic font-medium">
          — {displayVerse.reference}
        </cite>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-8">
          <Link href="/versets">
            <Button variant="outline" size="sm">
              <Book className="w-4 h-4 mr-2" />
              Mes versets
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
