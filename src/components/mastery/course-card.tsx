"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database, PathDifficulty } from "@/types/database";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"];

interface CourseCardProps {
  path: MasteryPath & {
    started: boolean;
    completed: boolean;
    progress: number;
    completedMilestones: number;
    totalMilestones: number;
  };
}

const difficultyLabels: Record<PathDifficulty, { label: string; dotColor: string }> = {
  beginner: { label: "Debutant", dotColor: "bg-success-500" },
  intermediate: { label: "Intermediaire", dotColor: "bg-accent-500" },
  advanced: { label: "Avance", dotColor: "bg-error-500" },
};

export function CourseCard({ path }: CourseCardProps) {
  const difficulty = difficultyLabels[path.difficulty];

  return (
    <Link href={`/parcours/${path.slug}`} className="group block">
      <div className="relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-parchment-200 dark:border-primary-700">
        {/* Image container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {path.cover_image_url ? (
            <Image
              src={path.cover_image_url}
              alt={path.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${path.color}30` }}
            >
              <BookOpen className="w-16 h-16" style={{ color: path.color }} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Status badge */}
          {path.completed ? (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-success-500 text-white rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Termine
            </div>
          ) : path.started ? (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-accent-500 text-white rounded-full text-xs font-medium">
              <Play className="w-3.5 h-3.5" />
              En cours
            </div>
          ) : null}

          {/* Progress bar overlay */}
          {path.started && !path.completed && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-accent-400 transition-all"
                style={{ width: `${path.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-1">
            {path.name}
          </h3>

          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1 line-clamp-2 min-h-[2.5rem]">
            {path.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 text-xs text-primary-500 dark:text-primary-400">
            <span className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", difficulty.dotColor)} />
              {difficulty.label}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {path.estimated_hours}h
            </span>
            <span>{path.totalMilestones} etapes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
