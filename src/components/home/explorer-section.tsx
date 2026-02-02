"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy } from "lucide-react";
import { FadeIn, Stagger, StaggerItem, MotionCard } from "@/components/ui/motion";

const explorerItems = [
  {
    href: "/bible",
    icon: BookOpen,
    title: "Bible",
    description: "Lire la Parole",
    gradient: "from-gold-400 to-gold-500",
  },
  {
    href: "/defi",
    icon: Target,
    title: "Défi Quotidien",
    description: "10 questions",
    gradient: "from-accent-400 to-accent-500",
  },
  {
    href: "/classement",
    icon: Trophy,
    title: "Classement",
    description: "Compétition",
    gradient: "from-primary-600 to-primary-700",
  },
];

export function ExplorerSection() {
  return (
    <FadeIn delay={0.4} className="mb-12">
      <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
        Explorer
      </h2>
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {explorerItems.map((item) => (
          <StaggerItem key={item.href}>
            <Link href={item.href}>
              <MotionCard>
                <div className="rounded-2xl overflow-hidden bg-parchment-50 dark:bg-primary-800 border border-parchment-300 dark:border-primary-700 shadow-card hover:shadow-elevated transition-shadow">
                  <div className={`h-24 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary-800 dark:text-parchment-50">
                      {item.title}
                    </h3>
                    <p className="text-sm text-primary-500 dark:text-primary-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </MotionCard>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </FadeIn>
  );
}
