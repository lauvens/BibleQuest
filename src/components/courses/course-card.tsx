"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, BookOpen } from "lucide-react";
import { MotionCard } from "@/components/ui/motion";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  progress?: number; // 0-100
  isNew?: boolean;
  moduleCount?: number;
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  progress,
  isNew,
  moduleCount,
}: CourseCardProps) {
  const hasProgress = typeof progress === "number" && progress > 0;

  return (
    <Link href={`/parcours/${id}`}>
      <MotionCard className="group h-full">
        <div className="rounded-2xl overflow-hidden bg-parchment-50 dark:bg-primary-800 border border-parchment-300 dark:border-primary-700 shadow-card hover:shadow-elevated transition-shadow">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-accent-400 to-accent-600 dark:from-accent-500 dark:to-accent-700">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/80" />
              </div>
            )}
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-elevated">
                <Play className="w-6 h-6 text-primary-800 ml-1" />
              </div>
            </div>
            {/* New badge */}
            {isNew && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold-400 text-primary-900 text-xs font-bold">
                Nouveau
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-1 line-clamp-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-primary-500 dark:text-primary-400 mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Progress bar or module count */}
            {hasProgress ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-primary-500 dark:text-primary-400">Progression</span>
                  <span className="font-medium text-accent-600 dark:text-accent-400">{progress}%</span>
                </div>
                <div className="h-2 bg-parchment-300 dark:bg-primary-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : moduleCount ? (
              <p className="text-xs text-primary-400 dark:text-primary-500">
                {moduleCount} modules
              </p>
            ) : null}
          </div>
        </div>
      </MotionCard>
    </Link>
  );
}
