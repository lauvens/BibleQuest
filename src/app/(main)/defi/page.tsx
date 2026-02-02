"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyChallengeTab } from "@/components/defi/daily-challenge-tab";
import { LessonsTab } from "@/components/defi/lessons-tab";

type TabType = "challenge" | "lessons";

function DefiContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const tabParam = searchParams.get("tab");

  // Default to lessons tab if category param is present, otherwise challenge
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === "lessons" || categoryParam ? "lessons" : "challenge"
  );

  const tabs = [
    {
      id: "challenge" as TabType,
      label: "Defi du Jour",
      icon: Target,
    },
    {
      id: "lessons" as TabType,
      label: "Lecons",
      icon: BookOpen,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-6">Defi</h1>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-8 p-1 bg-parchment-100 dark:bg-primary-850 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                {
                  "bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 shadow-sm": isActive,
                  "text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300": !isActive,
                }
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "challenge" && <DailyChallengeTab />}
        {activeTab === "lessons" && <LessonsTab initialCategory={categoryParam} />}
      </div>
    </div>
  );
}

export default function DefiPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8">Chargement...</div>}>
      <DefiContent />
    </Suspense>
  );
}
