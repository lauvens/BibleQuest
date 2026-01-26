"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
}

export function HeartsDisplay({
  hearts,
  maxHearts = 5,
  className,
}: HeartsDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxHearts }).map((_, i) => (
        <Heart
          key={i}
          className={cn("w-6 h-6 transition-colors", {
            "fill-heart text-heart": i < hearts,
            "fill-gray-200 text-gray-200": i >= hearts,
          })}
        />
      ))}
    </div>
  );
}
