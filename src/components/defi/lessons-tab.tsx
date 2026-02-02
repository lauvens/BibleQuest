"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scroll, Map, BookOpen, Church, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";
import { getCategories, getCategoryWithProgress } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

const categoryIcons: Record<string, React.ReactNode> = {
  scroll: <Scroll className="w-8 h-8" />,
  map: <Map className="w-8 h-8" />,
  "book-open": <BookOpen className="w-8 h-8" />,
  church: <Church className="w-8 h-8" />,
};

const categoryNames: Record<string, { name: string; description: string }> = {
  history: { name: "Histoire Biblique", description: "Decouvrez la chronologie et les evenements majeurs de la Bible" },
  context: { name: "Contexte Culturel", description: "Explorez la geographie et la culture de l'epoque biblique" },
  verses: { name: "Versets Cles", description: "Memorisez les versets les plus importants" },
  doctrines: { name: "Doctrines", description: "Comprenez les fondements de la foi chretienne" },
};

interface UnitWithProgress {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  unlock_threshold: number;
  progress: number;
  completedCount: number;
  lessons: {
    id: string;
    name: string;
    order_index: number;
    completed: boolean;
    bestScore: number;
  }[];
}

interface LessonsTabProps {
  initialCategory?: string | null;
}

export function LessonsTab({ initialCategory }: LessonsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const { id: userId, guestProgress, isGuest } = useUserStore();

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setUnits([]);
      setCategoryInfo(null);
      return;
    }
    setLoading(true);
    getCategoryWithProgress(selectedCategory, isGuest ? null : userId)
      .then((result) => {
        const names = categoryNames[selectedCategory] || {
          name: selectedCategory,
          description: "",
        };
        setCategoryInfo(names);

        // Apply guest progress if guest
        if (isGuest) {
          setUnits(
            result.units.map((u: UnitWithProgress) => ({
              ...u,
              lessons: u.lessons.map((l: UnitWithProgress["lessons"][number]) => ({
                ...l,
                completed: guestProgress.lessonProgress[l.id]?.completed ?? false,
                bestScore: guestProgress.lessonProgress[l.id]?.bestScore ?? 0,
              })),
              progress: (() => {
                const completed = u.lessons.filter(
                  (l: UnitWithProgress["lessons"][number]) => guestProgress.lessonProgress[l.id]?.completed
                ).length;
                return u.lessons.length > 0
                  ? Math.round((completed / u.lessons.length) * 100)
                  : 0;
              })(),
            }))
          );
        } else {
          setUnits(result.units);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [selectedCategory, userId, isGuest, guestProgress]);

  // Determine which units are locked based on previous unit completion
  const getLockedStatus = (unitIndex: number): boolean => {
    if (unitIndex === 0) return false;
    const prevUnit = units[unitIndex - 1];
    if (!prevUnit) return true;
    return prevUnit.progress < 100;
  };

  return (
    <div>
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-600 p-4 rounded-xl mb-6 text-center">
          <p className="mb-2">Erreur de chargement des donnees.</p>
          <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary-600 hover:underline">
            Reessayer
          </button>
        </div>
      )}

      {/* Category selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name_key)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              {
                "border-parchment-300 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-500":
                  selectedCategory !== category.name_key,
                "ring-2 ring-offset-2": selectedCategory === category.name_key,
              }
            )}
            style={{
              borderColor:
                selectedCategory === category.name_key
                  ? category.color
                  : undefined,
              // @ts-expect-error CSS custom property for ring color
              "--tw-ring-color": category.color,
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }}>
                {categoryIcons[category.icon]}
              </span>
            </div>
            <span className="font-medium text-sm">
              {categoryNames[category.name_key]?.name || category.name_key}
            </span>
          </button>
        ))}
      </div>

      {/* Selected category content */}
      {loading ? (
        <div className="text-center py-12 text-primary-500 dark:text-primary-400">Chargement...</div>
      ) : selectedCategory && categoryInfo ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-1">
              {categoryInfo.name}
            </h2>
            <p className="text-primary-600 dark:text-primary-400">{categoryInfo.description}</p>
          </div>

          {/* Units */}
          <div className="space-y-4">
            {units.map((unit, unitIndex) => {
              const locked = getLockedStatus(unitIndex);
              return (
                <Card
                  key={unit.id}
                  className={cn({ "opacity-60": locked })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor:
                              categories.find((c) => c.name_key === selectedCategory)
                                ?.color || "#666",
                          }}
                        >
                          {unitIndex + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-800 dark:text-parchment-50">
                            {unit.name}
                          </h3>
                          <p className="text-sm text-primary-500 dark:text-primary-400">
                            {locked
                              ? "Completez l'unite precedente pour debloquer"
                              : `${unit.lessons.filter((l) => l.completed).length}/${unit.lessons.length} lecons`}
                          </p>
                        </div>
                      </div>
                      {locked && <Lock className="w-5 h-5 text-primary-400 dark:text-primary-600" />}
                    </div>

                    {!locked && (
                      <>
                        <ProgressBar
                          value={unit.progress}
                          max={100}
                          className="mb-4"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {unit.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/lecon/${lesson.id}`}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                                {
                                  "border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/30": lesson.completed,
                                  "border-parchment-300 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30":
                                    !lesson.completed,
                                }
                              )}
                            >
                              {lesson.completed ? (
                                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-primary-300 dark:border-primary-600 flex-shrink-0" />
                              )}
                              <span
                                className={cn("text-sm font-medium", {
                                  "text-success-700 dark:text-success-400": lesson.completed,
                                  "text-primary-700 dark:text-primary-300": !lesson.completed,
                                })}
                              >
                                {lesson.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-50 mb-2">
            Choisissez une categorie
          </h2>
          <p className="text-primary-600 dark:text-primary-400">
            Selectionnez une categorie ci-dessus pour commencer a apprendre
          </p>
        </div>
      )}
    </div>
  );
}
