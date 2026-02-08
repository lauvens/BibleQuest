"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MilestoneContent } from "@/components/mastery/milestone-content";
import { useUserStore } from "@/lib/store/user-store";
import {
  getMasteryPathBySlug,
  getPathMilestones,
  getMilestone,
  getUserMilestonesProgress,
} from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type MasteryPath = Database["public"]["Tables"]["mastery_paths"]["Row"];
type Milestone = Database["public"]["Tables"]["path_milestones"]["Row"];

export default function MilestonePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const milestoneId = params.milestoneId as string;

  const { id: userId, isGuest, guestProgress } = useUserStore();

  const [path, setPath] = useState<MasteryPath | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug || !milestoneId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load path and milestone in parallel
        const [pathData, milestoneData] = await Promise.all([
          getMasteryPathBySlug(slug),
          getMilestone(milestoneId),
        ]);

        setPath(pathData);
        setMilestone(milestoneData);

        // Load all milestones (uses pathData.id so must be sequential)
        const milestones = await getPathMilestones(pathData.id);
        setAllMilestones(milestones);

        const index = milestones.findIndex((m) => m.id === milestoneId);
        setMilestoneIndex(index);

        // Check if milestone is unlocked
        if (index > 0) {
          if (isGuest) {
            // Check guest progress
            const prevMilestoneId = milestones[index - 1].id;
            const prevCompleted = guestProgress.milestoneProgress[prevMilestoneId]?.completed ?? false;
            setIsUnlocked(prevCompleted);
          } else if (userId) {
            // Check database progress
            const prevMilestoneIds = milestones.slice(0, index).map((m) => m.id);
            const progress = await getUserMilestonesProgress(userId, prevMilestoneIds);
            const prevCompleted = progress.some(
              (p) => p.milestone_id === milestones[index - 1].id && p.completed
            );
            setIsUnlocked(prevCompleted);
          }
        } else {
          setIsUnlocked(true); // First milestone is always unlocked
        }
      } catch (err) {
        console.error("Failed to load milestone:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, milestoneId, userId, isGuest, guestProgress]);

  const nextMilestoneId = allMilestones[milestoneIndex + 1]?.id ?? null;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-error-600 dark:text-error-400 mb-4">
          Impossible de charger cette etape.
        </p>
        <Button onClick={() => router.push(`/parcours/${slug}`)} variant="outline">
          Retour au parcours
        </Button>
      </div>
    );
  }

  if (loading || !path || !milestone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-primary-500 dark:text-primary-400">
        Chargement de l&apos;etape...
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-primary-400 dark:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          Etape verrouillee
        </h1>
        <p className="text-primary-600 dark:text-primary-400 mb-6">
          Completez les etapes precedentes pour debloquer celle-ci.
        </p>
        <Button onClick={() => router.push(`/parcours/${slug}`)} variant="outline">
          Retour au parcours
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <MilestoneContent
        milestone={milestone}
        pathSlug={slug}
        pathId={path.id}
        pathColor={path.color}
        pathName={path.name}
        nextMilestoneId={nextMilestoneId}
        milestoneIndex={milestoneIndex}
        totalMilestones={allMilestones.length}
      />
    </div>
  );
}
