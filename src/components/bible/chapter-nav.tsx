"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChapterNavProps {
  bookName: string;
  currentChapter: number;
  totalChapters: number;
}

export function ChapterNav({ bookName, currentChapter, totalChapters }: ChapterNavProps) {
  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;
  const encodedBook = encodeURIComponent(bookName);

  return (
    <div className="flex items-center justify-between gap-4">
      {hasPrev ? (
        <Link href={`/bible/${encodedBook}/${currentChapter - 1}`}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Chapitre {currentChapter - 1}
          </Button>
        </Link>
      ) : (
        <div />
      )}

      <span className="text-sm text-primary-500 dark:text-primary-400">
        {currentChapter} / {totalChapters}
      </span>

      {hasNext ? (
        <Link href={`/bible/${encodedBook}/${currentChapter + 1}`}>
          <Button variant="outline" size="sm">
            Chapitre {currentChapter + 1}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
