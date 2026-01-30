"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface BookCardProps {
  name: string;
  abbreviation: string;
  chapters: number;
  testament: "old" | "new";
}

export function BookCard({ name, chapters, testament }: BookCardProps) {
  const colors = testament === "old"
    ? "bg-olive-100 dark:bg-olive-900/40 text-olive-700 dark:text-olive-300"
    : "bg-info-100 dark:bg-info-900/40 text-info-700 dark:text-info-300";

  return (
    <Link href={`/bible/${encodeURIComponent(name)}`}>
      <Card variant="interactive" className="h-full">
        <CardContent className="p-4">
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${colors}`}>
            {testament === "old" ? "AT" : "NT"}
          </div>
          <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-1">
            {name}
          </h3>
          <p className="text-xs text-primary-400 dark:text-primary-500">
            {chapters} chapitre{chapters > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
