"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, CheckCircle, Play, Lock, Sparkles } from "lucide-react";
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
    isLocked?: boolean;
    requiredPathName?: string;
  };
}

const difficultyLabels: Record<PathDifficulty, { label: string; dotColor: string }> = {
  beginner: { label: "Debutant", dotColor: "bg-success-500" },
  intermediate: { label: "Intermediaire", dotColor: "bg-accent-500" },
  advanced: { label: "Avance", dotColor: "bg-error-500" },
};

export function CourseCard({ path }: CourseCardProps) {
  const difficulty = difficultyLabels[path.difficulty];
  const isComingSoon = path.is_coming_soon;
  const isLocked = path.isLocked && !isComingSoon;
  const isDisabled = isComingSoon || isLocked;

  const cardContent = (
    <div
      className={cn(
        "relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 h-full border border-parchment-200 dark:border-primary-700",
        isDisabled ? "opacity-75" : "hover:shadow-xl"
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {path.cover_image_url ? (
          <Image
            src={path.cover_image_url}
            alt={path.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              !isDisabled && "group-hover:scale-105",
              isDisabled && "grayscale"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn("w-full h-full flex items-center justify-center", isDisabled && "grayscale")}
            style={{ backgroundColor: `${path.color}30` }}
          >
            <BookOpen className="w-16 h-16" style={{ color: path.color }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Status badge - Priority: Coming Soon > Locked > Completed > In Progress */}
        {isComingSoon ? (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-primary-600 text-white rounded-full text-xs font-medium"
            role="status"
            aria-label="Parcours bientot disponible"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Bientot disponible
          </div>
        ) : isLocked ? (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-primary-500 text-white rounded-full text-xs font-medium"
            role="status"
            aria-label="Parcours verrouille"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Verrouille
          </div>
        ) : path.completed ? (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-success-500 text-white rounded-full text-xs font-medium"
            role="status"
            aria-label="Parcours termine"
          >
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Termine
          </div>
        ) : path.started ? (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-accent-500 text-white rounded-full text-xs font-medium"
            role="status"
            aria-label="Parcours en cours"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            En cours
          </div>
        ) : null}

        {/* Progress bar overlay */}
        {path.started && !path.completed && !isDisabled && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-accent-400 transition-all"
              style={{ width: `${path.progress}%` }}
              role="progressbar"
              aria-valuenow={path.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={cn(
            "font-semibold text-lg line-clamp-1 transition-colors",
            isDisabled
              ? "text-primary-500 dark:text-primary-500"
              : "text-primary-800 dark:text-parchment-50 group-hover:text-primary-600 dark:group-hover:text-accent-400"
          )}
        >
          {path.name}
        </h3>

        <p className="text-sm text-primary-500 dark:text-primary-400 mt-1 line-clamp-2 min-h-[2.5rem]">
          {isLocked && path.requiredPathName
            ? `Terminez "${path.requiredPathName}" pour debloquer`
            : path.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-3 text-xs text-primary-500 dark:text-primary-400">
          <span className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", difficulty.dotColor)} aria-hidden="true" />
            {difficulty.label}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {path.estimated_hours}h
          </span>
          <span>{path.totalMilestones} etapes</span>
        </div>
      </div>
    </div>
  );

  // Conditional rendering without creating inline components
  if (isDisabled) {
    return <div className="cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/parcours/${path.slug}`} className="group block">
      {cardContent}
    </Link>
  );
}
