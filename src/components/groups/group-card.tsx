"use client";

import Link from "next/link";
import { Users, Calendar, Crown, Shield, User } from "lucide-react";

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

const roleConfig = {
  owner: { label: "Chef", icon: Crown, color: "text-amber-500" },
  admin: { label: "Admin", icon: Shield, color: "text-blue-500" },
  member: { label: "Membre", icon: User, color: "text-primary-400" },
};

export function GroupCard({ group, memberCount, activeChallenges, userRole }: GroupCardProps) {
  const { label: roleLabel, icon: RoleIcon, color: roleColor } = roleConfig[userRole];

  return (
    <Link href={`/groupes/${group.id}`} className="group block">
      <div className="relative bg-white dark:bg-primary-800/50 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-primary-900/50 transition-all duration-300 h-full border border-parchment-200 dark:border-primary-700/50 hover:border-primary-300 dark:hover:border-primary-600">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Color indicator - small dot */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-700/50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600 dark:text-primary-300" />
              </div>
              {/* Color accent dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-primary-800"
                style={{ backgroundColor: group.cover_color }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary-800 dark:text-parchment-100 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-1">
                {group.name}
              </h3>
              {/* Role badge */}
              <div className="flex items-center gap-1 mt-0.5">
                <RoleIcon className={`w-3 h-3 ${roleColor}`} />
                <span className="text-xs text-primary-500 dark:text-primary-400">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {group.description && (
            <p className="text-sm text-primary-500 dark:text-primary-400 mb-3 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-primary-500 dark:text-primary-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {memberCount} membre{memberCount > 1 ? "s" : ""}
            </span>
            {activeChallenges > 0 && (
              <span className="flex items-center gap-1.5 text-accent-600 dark:text-accent-400">
                <Calendar className="w-3.5 h-3.5" />
                {activeChallenges} défi{activeChallenges > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
