"use client";

import Link from "next/link";

interface ChapterGridProps {
  bookName: string;
  totalChapters: number;
  className?: string;
}

export function ChapterGrid({ bookName, totalChapters, className = "" }: ChapterGridProps) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className={`grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 ${className}`}>
      {chapters.map((chapter) => (
        <Link
          key={chapter}
          href={`/bible/${encodeURIComponent(bookName)}/${chapter}`}
          className="aspect-square flex items-center justify-center rounded-lg
            bg-parchment-100 dark:bg-primary-800
            hover:bg-gold-100 dark:hover:bg-gold-900/40
            text-primary-700 dark:text-parchment-100
            hover:text-gold-700 dark:hover:text-gold-400
            font-semibold text-sm transition-colors
            border border-parchment-300 dark:border-primary-700
            hover:border-gold-300 dark:hover:border-gold-700"
        >
          {chapter}
        </Link>
      ))}
    </div>
  );
}
