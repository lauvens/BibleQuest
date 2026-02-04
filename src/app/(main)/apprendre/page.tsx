"use client";

import { useState, useEffect, useMemo } from "react";
import { Compass, BookOpen, Scroll, Users, History, Lightbulb, Search, Church } from "lucide-react";
import { CourseCard } from "@/components/mastery/course-card";
import { useUserStore } from "@/lib/store/user-store";
import { getMasteryPathsWithProgress } from "@/lib/supabase/queries";
import { Database, PathCategory } from "@/types/database";
import { cn } from "@/lib/utils";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"] & {
  started: boolean;
  completed: boolean;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
  isLocked?: boolean;
  requiredPathName?: string;
};

const categoryConfig: Record<
  PathCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string; comingSoon?: boolean }
> = {
  doctrine: {
    label: "Doctrine",
    icon: Lightbulb,
    description: "Les fondements de la foi chretienne",
  },
  bible_study: {
    label: "Etudes bibliques",
    icon: BookOpen,
    description: "Approfondissez les livres de la Bible",
  },
  characters: {
    label: "Personnages",
    icon: Users,
    description: "Decouvrez les heros de la foi",
  },
  history: {
    label: "Histoire",
    icon: History,
    description: "L'histoire de l'Eglise et de la Bible",
  },
  practical: {
    label: "Vie pratique",
    icon: Scroll,
    description: "Appliquer la foi au quotidien",
  },
  theology: {
    label: "Theologie",
    icon: Church,
    description: "Approfondissement theologique avance",
  },
};

// Order of categories to display
const categoryOrder: PathCategory[] = ["doctrine", "bible_study", "characters", "history", "practical", "theology"];

export default function ApprendrePage() {
  const { id: userId, isGuest, guestProgress } = useUserStore();

  const [paths, setPaths] = useState<MasteryPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PathCategory | "all">("all");

  useEffect(() => {
    setLoading(true);
    getMasteryPathsWithProgress(isGuest ? null : userId)
      .then((data) => {
        if (isGuest) {
          const pathProgress = guestProgress?.pathProgress || {};

          // First pass: calculate completion status for all paths
          const pathCompletionMap: Record<string, boolean> = {};
          data.forEach((path) => {
            const guestPathProgress = pathProgress[path.id];
            // Consider a path "complete" if guest has progressed through all milestones
            // or reached 100% progress (5 milestones at 20% each)
            const currentIndex = guestPathProgress?.currentMilestoneIndex || 0;
            const isComplete = currentIndex >= path.totalMilestones && path.totalMilestones > 0;
            pathCompletionMap[path.id] = isComplete;
          });

          // Second pass: calculate locked status based on local completion
          const pathsWithGuestProgress = data.map((path) => {
            const guestPathProgress = pathProgress[path.id];
            const started = !!guestPathProgress?.started;
            const currentIndex = guestPathProgress?.currentMilestoneIndex || 0;

            // Check if prerequisite is completed locally
            let isLocked = false;
            if (path.required_path_id) {
              isLocked = !pathCompletionMap[path.required_path_id];
            }

            return {
              ...path,
              started,
              completed: pathCompletionMap[path.id] || false,
              progress: started ? Math.min(currentIndex * 20, 100) : 0,
              isLocked,
              requiredPathName: path.requiredPathName,
            };
          });
          setPaths(pathsWithGuestProgress);
        } else {
          setPaths(data);
        }
      })
      .catch((err) => {
        console.error("Error loading paths:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [userId, isGuest, guestProgress]);

  // Filter paths by search and category
  const filteredPaths = useMemo(() => {
    return paths.filter((path) => {
      const matchesSearch =
        searchQuery === "" ||
        path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const pathCategory = path.category || "doctrine";
      const matchesCategory = activeCategory === "all" || pathCategory === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [paths, searchQuery, activeCategory]);

  // Group paths by category
  const pathsByCategory = useMemo(() => {
    const grouped: Record<PathCategory, MasteryPath[]> = {
      doctrine: [],
      bible_study: [],
      characters: [],
      history: [],
      practical: [],
      theology: [],
    };

    filteredPaths.forEach((path) => {
      const cat = path.category || "doctrine"; // Default to doctrine if no category
      if (grouped[cat]) {
        grouped[cat].push(path);
      }
    });

    return grouped;
  }, [filteredPaths]);

  // Get categories that have paths
  const availableCategories = useMemo(() => {
    return categoryOrder.filter((cat) => paths.some((p) => (p.category || "doctrine") === cat));
  }, [paths]);

  // Stats
  const totalPaths = paths.length;
  const inProgressCount = paths.filter((p) => p.started && !p.completed).length;
  const completedCount = paths.filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header section */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Parcours d&apos;apprentissage</h1>
              <p className="text-primary-200 mt-1">
                Approfondissez vos connaissances bibliques et theologiques
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalPaths}</span>
              <span className="text-primary-200">parcours</span>
            </div>
            {inProgressCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-accent-400">{inProgressCount}</span>
                <span className="text-primary-200">en cours</span>
              </div>
            )}
            {completedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-success-400">{completedCount}</span>
                <span className="text-primary-200">termines</span>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Rechercher un parcours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-primary-850 border-b border-parchment-200 dark:border-primary-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === "all"
                  ? "bg-primary-100 dark:bg-primary-700 text-primary-800 dark:text-white"
                  : "text-primary-600 dark:text-primary-400 hover:bg-parchment-100 dark:hover:bg-primary-800"
              )}
            >
              Tous ({totalPaths})
            </button>
            {availableCategories.map((cat) => {
              const config = categoryConfig[cat];
              const count = pathsByCategory[cat].length;
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    activeCategory === cat
                      ? "bg-primary-100 dark:bg-primary-700 text-primary-800 dark:text-white"
                      : "text-primary-600 dark:text-primary-400 hover:bg-parchment-100 dark:hover:bg-primary-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error state */}
        {error && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 p-6 rounded-2xl mb-8 text-center">
            <p className="mb-3">Erreur de chargement des parcours.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Reessayer
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-primary-850 rounded-2xl overflow-hidden border border-parchment-200 dark:border-primary-700 animate-pulse"
              >
                <div className="aspect-[16/10] bg-parchment-200 dark:bg-primary-700" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-parchment-200 dark:bg-primary-700 rounded w-3/4" />
                  <div className="h-4 bg-parchment-100 dark:bg-primary-800 rounded w-full" />
                  <div className="h-4 bg-parchment-100 dark:bg-primary-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paths display */}
        {!loading && !error && (
          <>
            {activeCategory === "all" ? (
              // Show by category sections
              <div className="space-y-12">
                {categoryOrder.map((cat) => {
                  const categoryPaths = pathsByCategory[cat];
                  if (categoryPaths.length === 0) return null;

                  const config = categoryConfig[cat];
                  const Icon = config.icon;

                  return (
                    <section key={cat}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
                            {config.label}
                          </h2>
                          <p className="text-sm text-primary-500 dark:text-primary-400">
                            {config.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryPaths.map((path) => (
                          <CourseCard key={path.id} path={path} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              // Show filtered grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPaths.map((path) => (
                  <CourseCard key={path.id} path={path} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredPaths.length === 0 && (
              <div className="text-center py-16">
                <Compass className="w-20 h-20 text-primary-200 dark:text-primary-700 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-primary-800 dark:text-parchment-50 mb-3">
                  Aucun parcours trouve
                </h2>
                <p className="text-primary-600 dark:text-primary-400 max-w-md mx-auto">
                  {searchQuery
                    ? "Essayez d&apos;autres termes de recherche"
                    : "Les parcours seront bientot disponibles"}
                </p>
                {(searchQuery || activeCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="mt-4 text-accent-600 dark:text-accent-400 font-medium hover:underline"
                  >
                    Voir tous les parcours
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
