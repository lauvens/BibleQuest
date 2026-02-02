"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { MotionCard } from "@/components/ui/motion";

interface CategoryCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export function CategoryCard({ href, icon: Icon, title, description, gradient }: CategoryCardProps) {
  return (
    <Link href={href}>
      <MotionCard>
        <div className="rounded-2xl overflow-hidden bg-parchment-50 dark:bg-primary-800 border border-parchment-300 dark:border-primary-700 shadow-card hover:shadow-elevated transition-all">
          {/* Large icon area */}
          <div className={`h-32 md:h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
              <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          {/* Text content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-primary-800 dark:text-parchment-50 mb-1">
              {title}
            </h3>
            <p className="text-sm text-primary-500 dark:text-primary-400">
              {description}
            </p>
          </div>
        </div>
      </MotionCard>
    </Link>
  );
}
