"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  BookOpen,
  Scroll,
  Church,
  Shield,
  Crown,
  Star,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Database, PathDifficulty } from "@/types/database";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"];

interface PathProgressHeaderProps {
  path: MasteryPath;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
}

const pathIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  scroll: Scroll,
  church: Church,
  shield: Shield,
  crown: Crown,
  star: Star,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
};

const difficultyLabels: Record<PathDifficulty, string> = {
  beginner: "Debutant",
  intermediate: "Intermediaire",
  advanced: "Avance",
};

export function PathProgressHeader({
  path,
  progress,
  completedMilestones,
  totalMilestones,
}: PathProgressHeaderProps) {
  const Icon = pathIcons[path.icon] || BookOpen;
  const isCompleted = progress === 100;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: path.color }}
      />

      {/* Content */}
      <div className="relative p-6">
        {/* Back link */}
        <Link
          href="/apprendre"
          className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux parcours
        </Link>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${path.color}30`, color: path.color }}
          >
            <Icon className="w-8 h-8" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
                {path.name}
              </h1>
              {isCompleted && (
                <CheckCircle className="w-6 h-6 text-success-500" />
              )}
            </div>
            <p className="text-primary-600 dark:text-primary-400 mb-3">
              {path.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-primary-500 dark:text-primary-400">
              <span
                className="font-medium"
                style={{ color: path.color }}
              >
                {difficultyLabels[path.difficulty]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {path.estimated_hours}h estimees
              </span>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="mt-6 p-4 bg-white/50 dark:bg-primary-900/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Progression
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: path.color }}
            >
              {progress}%
            </span>
          </div>
          <ProgressBar
            value={progress}
            max={100}
            className="h-3 mb-2"
          />
          <div className="flex items-center justify-between text-xs text-primary-500 dark:text-primary-400">
            <span>{completedMilestones} etapes terminees</span>
            <span>{totalMilestones - completedMilestones} restantes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
