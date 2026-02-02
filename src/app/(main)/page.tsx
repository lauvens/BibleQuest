"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/home/hero-section";
import { CourseCard } from "@/components/courses/course-card";
import { DailyVerseSection } from "@/components/home/daily-verse-section";
import { ExplorerSection } from "@/components/home/explorer-section";
import { StreakCalendar } from "@/components/game/streak-calendar";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { useUserStore } from "@/lib/store/user-store";
import { getDailyVerse } from "@/lib/supabase/queries";

// Placeholder courses until database is ready
const placeholderCourses = [
  {
    id: "genesis",
    title: "Comprendre la Genèse",
    description: "Les fondements de la Bible",
    progress: 40,
    moduleCount: 8,
  },
  {
    id: "psalms",
    title: "Les Psaumes",
    description: "Poésie et louange",
    isNew: true,
    moduleCount: 12,
  },
  {
    id: "gospels",
    title: "Les Évangiles",
    description: "La vie de Jésus",
    moduleCount: 10,
  },
];

export default function HomePage() {
  const {
    isGuest,
    username,
    xp,
    level,
    coins,
    gems,
    currentStreak,
  } = useUserStore();

  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  // Generate placeholder active days (will be replaced with real data)
  const activeDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    // Generate random active days in the last 84 days
    for (let i = 0; i < 84; i++) {
      if (Math.random() > 0.6) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
      }
    }
    return days;
  }, []);

  useEffect(() => {
    getDailyVerse()
      .then(setVerse)
      .catch(() => null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <HeroSection
        username={username ?? undefined}
        isGuest={isGuest}
        xp={xp}
        level={level}
        coins={coins}
        gems={gems}
        streak={currentStreak}
      />

      {/* Recommended Courses */}
      <FadeIn delay={0.1} className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50">
            Parcours recommandés
          </h2>
          <Link
            href="/parcours"
            className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Voir tout
          </Link>
        </div>
        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderCourses.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                progress={course.progress}
                isNew={course.isNew}
                moduleCount={course.moduleCount}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>

      {/* Daily Verse */}
      <DailyVerseSection verse={verse} />

      {/* Streak Calendar */}
      <FadeIn delay={0.35} className="mb-12">
        <Card>
          <CardContent className="p-6">
            <StreakCalendar activeDays={activeDays} />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Explorer */}
      <ExplorerSection />

      {/* Guest CTA */}
      {isGuest && (
        <FadeIn delay={0.5}>
          <div className="rounded-3xl border-2 border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mb-4 max-w-md mx-auto">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button size="lg">Créer un compte gratuit</Button>
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
