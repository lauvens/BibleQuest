"use client";

import { useRouter } from "next/navigation";
import { MilestoneNode } from "./milestone-node";
import { Database, MilestoneType } from "@/types/database";

type Milestone = Database["public"]["Tables"]["path_milestones"]["Row"] & {
  completed: boolean;
  bestScore: number;
  attempts: number;
  isUnlocked: boolean;
};

interface PathRoadmapProps {
  pathSlug: string;
  pathColor: string;
  milestones: Milestone[];
}

export function PathRoadmap({ pathSlug, pathColor, milestones }: PathRoadmapProps) {
  const router = useRouter();

  const handleMilestoneClick = (milestone: Milestone) => {
    if (milestone.isUnlocked) {
      router.push(`/parcours/${pathSlug}/${milestone.id}`);
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="text-center py-12 text-primary-500 dark:text-primary-400">
        Aucune etape disponible pour ce parcours.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {milestones.map((milestone, index) => (
        <MilestoneNode
          key={milestone.id}
          milestone={{
            ...milestone,
            milestone_type: milestone.milestone_type as MilestoneType,
          }}
          pathColor={pathColor}
          isFirst={index === 0}
          isLast={index === milestones.length - 1}
          onClick={() => handleMilestoneClick(milestone)}
        />
      ))}
    </div>
  );
}
