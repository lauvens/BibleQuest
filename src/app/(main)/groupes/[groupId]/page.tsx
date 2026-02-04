"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Settings,
  Copy,
  Check,
  Crown,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ChallengeCard } from "@/components/groups/challenge-card";
import { useUserStore } from "@/lib/store/user-store";
import {
  getGroupDetails,
  markChallengeCompleted,
} from "@/lib/supabase/queries";

type GroupDetails = Awaited<ReturnType<typeof getGroupDetails>>;
type GroupRole = "owner" | "admin" | "member";

const roleIcons: Record<GroupRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { id: userId, isGuest } = useUserStore();

  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenges" | "members">("challenges");

  const userMember = data?.members?.find((m) => m.user_id === userId);
  const isOwnerOrAdmin = userMember?.role === "owner" || userMember?.role === "admin";

  useEffect(() => {
    if (isGuest) {
      router.push("/connexion");
      return;
    }

    async function load() {
      try {
        const details = await getGroupDetails(groupId);
        setData(details);
      } catch (err) {
        console.error("Error loading group:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [groupId, isGuest, router]);

  async function handleCopyInviteCode() {
    if (!data?.group.invite_code) return;
    await navigator.clipboard.writeText(data.group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMarkComplete(challengeId: string) {
    if (!userId) return;
    try {
      await markChallengeCompleted(challengeId, userId);
      // Reload data
      const details = await getGroupDetails(groupId);
      setData(details);
    } catch (err) {
      console.error("Error marking complete:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.group) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
            Groupe non trouve
          </h1>
          <Link href="/groupes" className="text-primary-600 hover:underline mt-2 block">
            Retour aux groupes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div
        className="text-white"
        style={{ backgroundColor: data.group.cover_color }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{data.group.name}</h1>
              {data.group.description && (
                <p className="text-white/80 mt-2">{data.group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Users className="w-4 h-4" />
                  {data.members?.length || 0} membres
                </span>
              </div>
            </div>

            {isOwnerOrAdmin && (
              <Link
                href={`/groupes/${groupId}/parametres`}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Invite code */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-white/70 text-sm">Code d&apos;invitation:</span>
            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-mono transition-colors"
            >
              {data.group.invite_code}
              {copied ? (
                <Check className="w-4 h-4 text-success-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-primary-850 border-b border-parchment-200 dark:border-primary-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "challenges"
                  ? "border-primary-600 text-primary-800 dark:text-white"
                  : "border-transparent text-primary-500 hover:text-primary-700"
              }`}
            >
              Defis de lecture
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "members"
                  ? "border-primary-600 text-primary-800 dark:text-white"
                  : "border-transparent text-primary-500 hover:text-primary-700"
              }`}
            >
              Membres ({data.members?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "challenges" ? (
          <div className="space-y-6">
            {/* Add challenge button */}
            {isOwnerOrAdmin && (
              <Link
                href={`/groupes/${groupId}/nouveau-defi`}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-2xl text-primary-600 dark:text-primary-400 hover:border-primary-400 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Creer un nouveau defi de lecture
              </Link>
            )}

            {/* Challenges list */}
            {data.challenges && data.challenges.length > 0 ? (
              <div className="space-y-4">
                {data.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    totalMembers={data.members?.length || 0}
                    completedCount={0}
                    onMarkComplete={() => handleMarkComplete(challenge.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-primary-500 dark:text-primary-400">
                  Aucun defi de lecture actif
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Members list */
          <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
            <div className="divide-y divide-parchment-100 dark:divide-primary-700">
              {data.members?.map((member) => {
                const user = member.users as unknown as {
                  id: string;
                  username: string | null;
                  avatar_url: string | null;
                  xp: number;
                  level: number;
                } | null;
                const RoleIcon = roleIcons[member.role as GroupRole];
                if (!user) return null;

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 hover:bg-parchment-50 dark:hover:bg-primary-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-800 dark:text-parchment-50">
                          {user.username || "Utilisateur"}
                        </span>
                        <RoleIcon
                          className={`w-4 h-4 ${
                            member.role === "owner"
                              ? "text-yellow-500"
                              : member.role === "admin"
                              ? "text-blue-500"
                              : "text-primary-400"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-primary-500 dark:text-primary-400">
                        Niveau {user.level} • {user.xp} XP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
