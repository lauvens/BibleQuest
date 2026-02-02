"use client";

import {
  BookOpen,
  HelpCircle,
  BookText,
  MessageSquare,
  Lock,
  CheckCircle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MilestoneType } from "@/types/database";

interface MilestoneNodeProps {
  milestone: {
    id: string;
    name: string;
    description: string | null;
    milestone_type: MilestoneType;
    order_index: number;
    xp_reward: number;
    coin_reward: number;
    completed: boolean;
    bestScore: number;
    attempts: number;
    isUnlocked: boolean;
  };
  pathColor: string;
  isFirst: boolean;
  isLast: boolean;
  onClick?: () => void;
}

const milestoneTypeIcons: Record<MilestoneType, React.ComponentType<{ className?: string }>> = {
  lesson: BookOpen,
  quiz: HelpCircle,
  reading: BookText,
  reflection: MessageSquare,
};

const milestoneTypeLabels: Record<MilestoneType, string> = {
  lesson: "Lecon",
  quiz: "Quiz",
  reading: "Lecture",
  reflection: "Reflexion",
};

export function MilestoneNode({ milestone, pathColor, isFirst, isLast, onClick }: MilestoneNodeProps) {
  const Icon = milestoneTypeIcons[milestone.milestone_type];
  const typeLabel = milestoneTypeLabels[milestone.milestone_type];

  const isLocked = !milestone.isUnlocked;
  const isCompleted = milestone.completed;
  const isActive = milestone.isUnlocked && !milestone.completed;

  return (
    <div className="relative flex items-start gap-4">
      {/* Connection line */}
      {!isFirst && (
        <div
          className={cn(
            "absolute left-6 -top-8 w-0.5 h-8",
            isCompleted || isActive
              ? "bg-gradient-to-b"
              : "bg-primary-200 dark:bg-primary-700"
          )}
          style={
            isCompleted || isActive
              ? { background: `linear-gradient(to bottom, ${pathColor}, ${pathColor})` }
              : undefined
          }
        />
      )}
      {!isLast && (
        <div
          className={cn(
            "absolute left-6 top-12 w-0.5 h-8",
            isCompleted
              ? "bg-gradient-to-b"
              : "bg-primary-200 dark:bg-primary-700"
          )}
          style={
            isCompleted
              ? { background: `linear-gradient(to bottom, ${pathColor}, ${pathColor})` }
              : undefined
          }
        />
      )}

      {/* Node circle */}
      <button
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0",
          {
            "bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-600 cursor-not-allowed": isLocked,
            "text-white shadow-lg cursor-pointer hover:scale-110": isCompleted || isActive,
          }
        )}
        style={
          isCompleted || isActive
            ? { backgroundColor: pathColor }
            : undefined
        }
      >
        {isLocked ? (
          <Lock className="w-5 h-5" />
        ) : isCompleted ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      <button
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          "flex-1 text-left p-4 rounded-xl border-2 transition-all",
          {
            "border-primary-200 dark:border-primary-700 opacity-60 cursor-not-allowed": isLocked,
            "border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20": isCompleted,
            "border-primary-300 dark:border-primary-600 hover:border-opacity-100 hover:shadow-md cursor-pointer": isActive,
          }
        )}
        style={
          isActive
            ? { borderColor: `${pathColor}60` }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  {
                    "bg-primary-100 dark:bg-primary-800 text-primary-500 dark:text-primary-400": isLocked,
                    "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400": isCompleted,
                  }
                )}
                style={
                  isActive
                    ? { backgroundColor: `${pathColor}20`, color: pathColor }
                    : undefined
                }
              >
                {typeLabel}
              </span>
            </div>
            <h3
              className={cn(
                "font-semibold",
                {
                  "text-primary-400 dark:text-primary-600": isLocked,
                  "text-success-700 dark:text-success-400": isCompleted,
                  "text-primary-800 dark:text-parchment-50": isActive,
                }
              )}
            >
              {milestone.name}
            </h3>
            {milestone.description && (
              <p
                className={cn(
                  "text-sm mt-1",
                  {
                    "text-primary-300 dark:text-primary-700": isLocked,
                    "text-success-600 dark:text-success-500": isCompleted,
                    "text-primary-500 dark:text-primary-400": isActive,
                  }
                )}
              >
                {milestone.description}
              </p>
            )}
          </div>

          {/* Status/action indicator */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <div className="flex items-center gap-1 text-success-600 dark:text-success-400">
                <span className="text-sm font-medium">{milestone.bestScore}%</span>
              </div>
            ) : isActive ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${pathColor}20` }}
              >
                <Play className="w-4 h-4" style={{ color: pathColor }} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Rewards preview */}
        {!isLocked && !isCompleted && (
          <div className="flex items-center gap-3 mt-3 text-xs text-primary-500 dark:text-primary-400">
            <span>+{milestone.xp_reward} XP</span>
            <span>+{milestone.coin_reward} pieces</span>
          </div>
        )}
      </button>
    </div>
  );
}
