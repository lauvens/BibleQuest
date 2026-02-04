"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { getGroupByInviteCode, joinGroup, getGroupMembersCount } from "@/lib/supabase/queries";

function RejoindreGroupeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const { id: userId, isGuest } = useUserStore();
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundGroup, setFoundGroup] = useState<{
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    max_members: number;
    memberCount: number;
  } | null>(null);

  if (isGuest) {
    router.push("/connexion");
    return null;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setFoundGroup(null);

    try {
      const group = await getGroupByInviteCode(code.trim().toLowerCase());
      const memberCount = await getGroupMembersCount(group.id);

      setFoundGroup({
        ...group,
        memberCount,
      });
    } catch {
      setError("Code d'invitation invalide ou groupe non trouve.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!foundGroup || !userId) return;

    if (foundGroup.memberCount >= foundGroup.max_members) {
      setError("Ce groupe est complet.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await joinGroup(foundGroup.id, userId);
      router.push(`/groupes/${foundGroup.id}`);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "23505") {
        setError("Vous etes deja membre de ce groupe.");
      } else {
        setError("Erreur lors de l'adhesion. Veuillez reessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/groupes"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux groupes
        </Link>

        <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
          <div className="p-6 border-b border-parchment-200 dark:border-primary-700 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
              Rejoindre un groupe
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">
              Entrez le code d&apos;invitation du groupe
            </p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Code input */}
            <form onSubmit={handleSearch}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2C3D4"
                  maxLength={8}
                  className="flex-1 px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-center text-lg tracking-widest uppercase"
                />
                <button
                  type="submit"
                  disabled={!code.trim() || loading}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
                >
                  {loading && !foundGroup ? "..." : "Chercher"}
                </button>
              </div>
            </form>

            {/* Found group preview */}
            {foundGroup && (
              <div className="border border-parchment-200 dark:border-primary-700 rounded-xl overflow-hidden">
                {/* Color bar */}
                <div
                  className="h-1"
                  style={{ backgroundColor: foundGroup.cover_color }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 dark:ring-1 dark:ring-white/10"
                      style={{ backgroundColor: foundGroup.cover_color }}
                    />
                    <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50">
                      {foundGroup.name}
                    </h3>
                  </div>
                  {foundGroup.description && (
                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-3">
                      {foundGroup.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400">
                    <Users className="w-4 h-4" />
                    {foundGroup.memberCount}/{foundGroup.max_members} membres
                  </div>

                  <button
                    onClick={handleJoin}
                    disabled={loading || foundGroup.memberCount >= foundGroup.max_members}
                    className="w-full mt-4 py-3 bg-success-600 hover:bg-success-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
                  >
                    {loading ? "Adhesion..." : "Rejoindre ce groupe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RejoindreGroupePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RejoindreGroupeContent />
    </Suspense>
  );
}
