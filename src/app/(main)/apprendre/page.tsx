"use client";

import { useState, useEffect } from "react";
import { Compass, BookOpen, Filter, Clock, CheckCircle } from "lucide-react";
import { PathCard } from "@/components/mastery/path-card";
import { useUserStore } from "@/lib/store/user-store";
import { getMasteryPathsWithProgress } from "@/lib/supabase/queries";
import { Database, PathDifficulty } from "@/types/database";
import { cn } from "@/lib/utils";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"] & {
  started: boolean;
  completed: boolean;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
};

type FilterType = "all" | "in_progress" | "completed" | "not_started";
type DifficultyFilter = "all" | PathDifficulty;

export default function ApprendrePage() {
  const { id: userId, isGuest, guestProgress } = useUserStore();

  const [paths, setPaths] = useState<MasteryPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  useEffect(() => {
    setLoading(true);
    getMasteryPathsWithProgress(isGuest ? null : userId)
      .then((data) => {
        // Apply guest progress if guest
        if (isGuest) {
          const pathsWithGuestProgress = data.map((path) => {
            const guestPathProgress = guestProgress.pathProgress[path.id];
            const started = !!guestPathProgress?.started;

            // Count completed milestones from guest progress
            // This is a simplified version - in production you'd need to fetch milestone IDs
            return {
              ...path,
              started,
              completed: false, // Guest completion is harder to track without milestone IDs
              progress: started ? Math.min(guestPathProgress?.currentMilestoneIndex * 20, 100) : 0,
            };
          });
          setPaths(pathsWithGuestProgress);
        } else {
          setPaths(data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId, isGuest, guestProgress]);

  // Filter paths
  const filteredPaths = paths.filter((path) => {
    // Status filter
    if (statusFilter === "in_progress" && (!path.started || path.completed)) return false;
    if (statusFilter === "completed" && !path.completed) return false;
    if (statusFilter === "not_started" && path.started) return false;

    // Difficulty filter
    if (difficultyFilter !== "all" && path.difficulty !== difficultyFilter) return false;

    return true;
  });

  // Stats
  const totalPaths = paths.length;
  const inProgressCount = paths.filter((p) => p.started && !p.completed).length;
  const completedCount = paths.filter((p) => p.completed).length;
  const totalHours = paths.reduce((sum, p) => sum + p.estimated_hours, 0);

  const statusFilters: { id: FilterType; label: string; count: number }[] = [
    { id: "all", label: "Tous", count: totalPaths },
    { id: "in_progress", label: "En cours", count: inProgressCount },
    { id: "completed", label: "Termines", count: completedCount },
    { id: "not_started", label: "A commencer", count: totalPaths - inProgressCount - completedCount },
  ];

  const difficultyFilters: { id: DifficultyFilter; label: string }[] = [
    { id: "all", label: "Toutes difficultes" },
    { id: "beginner", label: "Debutant" },
    { id: "intermediate", label: "Intermediaire" },
    { id: "advanced", label: "Avance" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Compass className="w-6 h-6 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
              Parcours de Maitrise
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              Approfondissez vos connaissances theologiques
            </p>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
          <BookOpen className="w-5 h-5 text-primary-500 dark:text-primary-400 mb-2" />
          <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{totalPaths}</p>
          <p className="text-sm text-primary-500 dark:text-primary-400">Parcours</p>
        </div>
        <div className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
          <Clock className="w-5 h-5 text-accent-500 mb-2" />
          <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{totalHours}h</p>
          <p className="text-sm text-primary-500 dark:text-primary-400">De contenu</p>
        </div>
        <div className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
          <Filter className="w-5 h-5 text-gold-500 mb-2" />
          <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{inProgressCount}</p>
          <p className="text-sm text-primary-500 dark:text-primary-400">En cours</p>
        </div>
        <div className="p-4 bg-parchment-100 dark:bg-primary-850 rounded-xl">
          <CheckCircle className="w-5 h-5 text-success-500 mb-2" />
          <p className="text-2xl font-bold text-primary-800 dark:text-parchment-50">{completedCount}</p>
          <p className="text-sm text-primary-500 dark:text-primary-400">Termines</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                {
                  "bg-primary-600 text-white": statusFilter === filter.id,
                  "bg-parchment-100 dark:bg-primary-850 text-primary-600 dark:text-primary-400 hover:bg-parchment-200 dark:hover:bg-primary-800":
                    statusFilter !== filter.id,
                }
              )}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {difficultyFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDifficultyFilter(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                {
                  "bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-medium":
                    difficultyFilter === filter.id,
                  "text-primary-500 dark:text-primary-400 hover:bg-parchment-100 dark:hover:bg-primary-850":
                    difficultyFilter !== filter.id,
                }
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-600 p-4 rounded-xl mb-6 text-center">
          <p className="mb-2">Erreur de chargement des parcours.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            Reessayer
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-primary-500 dark:text-primary-400">
          Chargement des parcours...
        </div>
      )}

      {/* Paths grid */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredPaths.length > 0 ? (
            filteredPaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))
          ) : (
            <div className="text-center py-12">
              <Compass className="w-16 h-16 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-50 mb-2">
                Aucun parcours trouve
              </h2>
              <p className="text-primary-600 dark:text-primary-400">
                {statusFilter !== "all" || difficultyFilter !== "all"
                  ? "Essayez de modifier vos filtres"
                  : "Les parcours seront bientot disponibles"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
