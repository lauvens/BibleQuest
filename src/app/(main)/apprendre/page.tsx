"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scroll, Map, BookOpen, Church, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  scroll: <Scroll className="w-8 h-8" />,
  map: <Map className="w-8 h-8" />,
  "book-open": <BookOpen className="w-8 h-8" />,
  church: <Church className="w-8 h-8" />,
};

// Sample data - in production this would come from Supabase
const categories = [
  {
    id: "1",
    name_key: "history",
    name: "Histoire Biblique",
    icon: "scroll",
    color: "#f59e0b",
    description: "Découvrez la chronologie et les événements majeurs de la Bible",
    units: [
      {
        id: "u1",
        name: "La Creation",
        progress: 100,
        lessons: [
          { id: "l1", name: "Au commencement", completed: true },
          { id: "l2", name: "Le jardin d'Eden", completed: true },
          { id: "l3", name: "La chute", completed: true },
        ],
      },
      {
        id: "u2",
        name: "Les Patriarches",
        progress: 33,
        lessons: [
          { id: "l4", name: "Abraham", completed: true },
          { id: "l5", name: "Isaac", completed: false },
          { id: "l6", name: "Jacob", completed: false },
        ],
      },
      {
        id: "u3",
        name: "L'Exode",
        progress: 0,
        locked: true,
        lessons: [],
      },
    ],
  },
  {
    id: "2",
    name_key: "context",
    name: "Contexte Culturel",
    icon: "map",
    color: "#10b981",
    description: "Explorez la géographie et la culture de l'époque biblique",
    units: [
      {
        id: "u4",
        name: "Géographie",
        progress: 50,
        lessons: [
          { id: "l7", name: "La Terre Promise", completed: true },
          { id: "l8", name: "Jerusalem", completed: false },
        ],
      },
    ],
  },
  {
    id: "3",
    name_key: "verses",
    name: "Versets Cles",
    icon: "book-open",
    color: "#3b82f6",
    description: "Mémorisez les versets les plus importants",
    units: [
      {
        id: "u5",
        name: "Versets de Foi",
        progress: 0,
        lessons: [
          { id: "l9", name: "Jean 3:16", completed: false },
          { id: "l10", name: "Romains 8:28", completed: false },
        ],
      },
    ],
  },
  {
    id: "4",
    name_key: "doctrines",
    name: "Doctrines",
    icon: "church",
    color: "#8b5cf6",
    description: "Comprenez les fondements de la foi chrétienne",
    units: [
      {
        id: "u6",
        name: "La Trinité",
        progress: 0,
        locked: true,
        lessons: [],
      },
    ],
  },
];

function ApprendreContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam || null
  );

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const currentCategory = categories.find(
    (c) => c.name_key === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Apprendre</h1>

      {/* Category selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name_key)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              {
                "border-gray-200 hover:border-gray-300":
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
            <span className="font-medium text-sm">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Selected category content */}
      {currentCategory ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {currentCategory.name}
            </h2>
            <p className="text-gray-600">{currentCategory.description}</p>
          </div>

          {/* Units */}
          <div className="space-y-4">
            {currentCategory.units.map((unit, unitIndex) => (
              <Card
                key={unit.id}
                className={cn({
                  "opacity-60": unit.locked,
                })}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: currentCategory.color }}
                      >
                        {unitIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {unit.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {unit.locked
                            ? "Complétez l'unité précédente pour débloquer"
                            : `${unit.lessons.filter((l) => l.completed).length}/${unit.lessons.length} leçons`}
                        </p>
                      </div>
                    </div>
                    {unit.locked && <Lock className="w-5 h-5 text-gray-400" />}
                  </div>

                  {!unit.locked && (
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
                                "border-green-200 bg-green-50": lesson.completed,
                                "border-gray-200 hover:border-primary-300 hover:bg-primary-50":
                                  !lesson.completed,
                              }
                            )}
                          >
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={cn("text-sm font-medium", {
                                "text-green-700": lesson.completed,
                                "text-gray-700": !lesson.completed,
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
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Choisissez une catégorie
          </h2>
          <p className="text-gray-600">
            Sélectionnez une catégorie ci-dessus pour commencer à apprendre
          </p>
        </div>
      )}
    </div>
  );
}

export default function ApprendrePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8">Chargement...</div>}>
      <ApprendreContent />
    </Suspense>
  );
}
