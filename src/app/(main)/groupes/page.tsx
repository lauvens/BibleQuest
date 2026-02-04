"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search } from "lucide-react";
import Link from "next/link";
import { GroupCard } from "@/components/groups/group-card";
import { useUserStore } from "@/lib/store/user-store";
import { getUserGroups, getGroupMembersCount } from "@/lib/supabase/queries";

type GroupWithMeta = {
  group: {
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    is_public: boolean;
  };
  role: "owner" | "admin" | "member";
  memberCount: number;
  activeChallenges: number;
};

export default function GroupesPage() {
  const { id: userId, isGuest } = useUserStore();
  const [groups, setGroups] = useState<GroupWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isGuest || !userId) {
      setLoading(false);
      return;
    }

    async function loadGroups() {
      try {
        const data = await getUserGroups(userId!);
        const groupsWithMeta = await Promise.all(
          (data || []).map(async (item) => {
            const group = item.reading_groups as unknown as GroupWithMeta["group"];
            const memberCount = await getGroupMembersCount(group.id);
            return {
              group,
              role: item.role as "owner" | "admin" | "member",
              memberCount,
              activeChallenges: 0,
            };
          })
        );
        setGroups(groupsWithMeta);
      } catch (err) {
        console.error("Error loading groups:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, [userId, isGuest]);

  const filteredGroups = groups.filter(
    (g) =>
      g.group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isGuest) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Users className="w-20 h-20 text-primary-300 dark:text-primary-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-3">
            Groupes de lecture
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            Connectez-vous pour creer ou rejoindre des groupes de lecture biblique.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes groupes</h1>
                <p className="text-primary-200 mt-1">
                  Lisez la Bible ensemble avec vos amis
                </p>
              </div>
            </div>

            <Link
              href="/groupes/creer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Creer un groupe
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-primary-850 rounded-2xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-primary-200 dark:text-primary-700 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-50 mb-3">
              {searchQuery ? "Aucun groupe trouve" : "Aucun groupe"}
            </h2>
            <p className="text-primary-600 dark:text-primary-400 mb-6">
              {searchQuery
                ? "Essayez d'autres termes de recherche"
                : "Creez votre premier groupe ou rejoignez-en un avec un code d'invitation"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/groupes/creer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Creer un groupe
              </Link>
              <Link
                href="/groupes/rejoindre"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                Rejoindre
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(({ group, role, memberCount, activeChallenges }) => (
              <GroupCard
                key={group.id}
                group={group}
                memberCount={memberCount}
                activeChallenges={activeChallenges}
                userRole={role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
