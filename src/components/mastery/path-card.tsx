"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle,
  Play,
  Sparkles,
  GraduationCap,
  Scroll,
  Church,
  Shield,
  Crown,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { Database, PathDifficulty } from "@/types/database";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"];

interface PathCardProps {
  path: MasteryPath & {
    started: boolean;
    completed: boolean;
    progress: number;
    completedMilestones: number;
    totalMilestones: number;
  };
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

const difficultyLabels: Record<PathDifficulty, { label: string; color: string }> = {
  beginner: { label: "Debutant", color: "text-success-600 dark:text-success-400" },
  intermediate: { label: "Intermediaire", color: "text-accent-600 dark:text-accent-400" },
  advanced: { label: "Avance", color: "text-error-600 dark:text-error-400" },
};

export function PathCard({ path }: PathCardProps) {
  const Icon = pathIcons[path.icon] || BookOpen;
  const difficulty = difficultyLabels[path.difficulty];

  return (
    <Link href={`/parcours/${path.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Color banner */}
        <div
          className="h-2"
          style={{ backgroundColor: path.color }}
        />

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${path.color}20`, color: path.color }}
            >
              <Icon className="w-7 h-7" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                    {path.name}
                  </h3>
                  <p className="text-sm text-primary-500 dark:text-primary-400 line-clamp-2 mt-1">
                    {path.description}
                  </p>
                </div>

                {/* Status indicator */}
                {path.completed ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-success-100 dark:bg-success-900/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                    <span className="text-xs font-medium text-success-700 dark:text-success-400">Termine</span>
                  </div>
                ) : path.started ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent-100 dark:bg-accent-900/30 rounded-full">
                    <Play className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    <span className="text-xs font-medium text-accent-700 dark:text-accent-400">En cours</span>
                  </div>
                ) : null}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-primary-500 dark:text-primary-400">
                <span className={cn("font-medium", difficulty.color)}>
                  {difficulty.label}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {path.estimated_hours}h
                </span>
                <span>
                  {path.totalMilestones} etapes
                </span>
              </div>

              {/* Progress bar */}
              {path.started && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary-500 dark:text-primary-400">
                      {path.completedMilestones}/{path.totalMilestones} etapes
                    </span>
                    <span className="text-xs font-medium" style={{ color: path.color }}>
                      {path.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={path.progress}
                    max={100}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-primary-400 dark:text-primary-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
