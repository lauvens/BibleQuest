"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PathProgressHeader } from "@/components/mastery/path-progress-header";
import { PathRoadmap } from "@/components/mastery/path-roadmap";
import { useUserStore } from "@/lib/store/user-store";
import { getMasteryPathWithProgress, startPath } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"];
type Milestone = Database["public"]["Tables"]["path_milestones"]["Row"] & {
  completed: boolean;
  bestScore: number;
  attempts: number;
  isUnlocked: boolean;
};

interface PathData {
  path: MasteryPath;
  milestones: Milestone[];
  pathProgress: Database["public"]["Tables"]["user_path_progress"]["Row"] | null;
  overallProgress: number;
  completedMilestones: number;
  totalMilestones: number;
}

export default function ParcoursPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { id: userId, isGuest, guestProgress, updateGuestPathProgress } = useUserStore();

  const [data, setData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    getMasteryPathWithProgress(slug, isGuest ? null : userId)
      .then((result) => {
        // Apply guest progress if guest
        if (isGuest) {
          const milestonesWithGuestProgress = result.milestones.map((m, index) => {
            const guestMilestoneProgress = guestProgress.milestoneProgress[m.id];
            const completed = guestMilestoneProgress?.completed ?? false;

            // Check if previous milestone is completed for unlock logic
            const prevCompleted = index === 0 ||
              (guestProgress.milestoneProgress[result.milestones[index - 1]?.id]?.completed ?? false);

            return {
              ...m,
              completed,
              bestScore: guestMilestoneProgress?.bestScore ?? 0,
              isUnlocked: index === 0 || prevCompleted,
            };
          });

          const completedCount = milestonesWithGuestProgress.filter(m => m.completed).length;
          const progress = milestonesWithGuestProgress.length > 0
            ? Math.round((completedCount / milestonesWithGuestProgress.length) * 100)
            : 0;

          setData({
            ...result,
            milestones: milestonesWithGuestProgress,
            overallProgress: progress,
            completedMilestones: completedCount,
          });
        } else {
          setData(result);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, userId, isGuest, guestProgress]);

  const handleStartPath = async () => {
    if (!data) return;

    setStarting(true);

    try {
      if (isGuest) {
        updateGuestPathProgress(data.path.id, 0);
      } else if (userId) {
        await startPath(userId, data.path.id);
      }

      // Navigate to first milestone
      if (data.milestones.length > 0) {
        router.push(`/parcours/${slug}/${data.milestones[0].id}`);
      }
    } catch (err) {
      console.error("Failed to start path:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleContinue = () => {
    if (!data) return;

    // Find next uncompleted milestone
    const nextMilestone = data.milestones.find(m => !m.completed && m.isUnlocked);
    if (nextMilestone) {
      router.push(`/parcours/${slug}/${nextMilestone.id}`);
    } else if (data.milestones.length > 0) {
      // All completed, go to first milestone
      router.push(`/parcours/${slug}/${data.milestones[0].id}`);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-error-600 dark:text-error-400 mb-4">
          Impossible de charger ce parcours.
        </p>
        <Button onClick={() => router.push("/apprendre")} variant="outline">
          Retour aux parcours
        </Button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-primary-500 dark:text-primary-400">
        Chargement du parcours...
      </div>
    );
  }

  const hasStarted = data.pathProgress || (isGuest && guestProgress.pathProgress[data.path.id]?.started);
  const isCompleted = data.overallProgress === 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with progress */}
      <PathProgressHeader
        path={data.path}
        progress={data.overallProgress}
        completedMilestones={data.completedMilestones}
        totalMilestones={data.totalMilestones}
      />

      {/* Start/Continue button */}
      {!hasStarted && !isCompleted && (
        <div className="mb-8 p-6 bg-parchment-100 dark:bg-primary-850 rounded-xl text-center">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
            Pret a commencer?
          </h2>
          <p className="text-primary-600 dark:text-primary-400 mb-4">
            Ce parcours contient {data.totalMilestones} etapes pour approfondir vos connaissances.
          </p>
          <Button onClick={handleStartPath} disabled={starting} size="lg">
            {starting ? "Demarrage..." : "Commencer le parcours"}
          </Button>
        </div>
      )}

      {hasStarted && !isCompleted && (
        <div className="mb-8">
          <Button onClick={handleContinue} className="w-full md:w-auto" size="lg">
            Continuer le parcours
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="mb-8 p-6 bg-success-50 dark:bg-success-900/20 rounded-xl text-center">
          <h2 className="text-lg font-semibold text-success-700 dark:text-success-400 mb-2">
            Parcours termine!
          </h2>
          <p className="text-success-600 dark:text-success-500">
            Felicitations! Vous avez complete toutes les etapes de ce parcours.
          </p>
        </div>
      )}

      {/* Roadmap */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-6">
          Etapes du parcours
        </h2>
        <PathRoadmap
          pathSlug={slug}
          pathColor={data.path.color}
          milestones={data.milestones}
        />
      </div>
    </div>
  );
}
