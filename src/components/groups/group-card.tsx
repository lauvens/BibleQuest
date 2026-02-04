"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    is_public: boolean;
  };
  memberCount: number;
  activeChallenges: number;
  userRole: "owner" | "admin" | "member";
}

const roleLabels = {
  owner: "Chef",
  admin: "Admin",
  member: "Membre",
};

export function GroupCard({ group, memberCount, activeChallenges, userRole }: GroupCardProps) {
  return (
    <Link href={`/groupes/${group.id}`} className="group block">
      <div className="relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-parchment-200 dark:border-primary-700">
        {/* Color header */}
        <div
          className="h-24 relative"
          style={{ backgroundColor: group.cover_color }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Role badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-primary-800/90 rounded-full text-xs font-medium text-primary-700 dark:text-primary-200">
            {roleLabels[userRole]}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-1">
            {group.name}
          </h3>

          {group.description && (
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-primary-500 dark:text-primary-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {memberCount} membre{memberCount > 1 ? "s" : ""}
            </span>
            {activeChallenges > 0 && (
              <span className="flex items-center gap-1.5 text-accent-600 dark:text-accent-400">
                <Calendar className="w-4 h-4" />
                {activeChallenges} defi{activeChallenges > 1 ? "s" : ""} actif{activeChallenges > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
