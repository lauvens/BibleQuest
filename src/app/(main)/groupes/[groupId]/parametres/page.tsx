"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { getGroupDetails, leaveGroup } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";

export default function GroupParametresPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { id: userId } = useUserStore();

  const [group, setGroup] = useState<{
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    invite_code: string;
    creator_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = group?.creator_id === userId;

  useEffect(() => {
    async function load() {
      try {
        const data = await getGroupDetails(groupId);
        setGroup(data.group);
      } catch (err) {
        console.error("Error loading group:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [groupId]);

  async function handleCopyInviteCode() {
    if (!group?.invite_code) return;
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLeaveGroup() {
    if (!userId) return;
    try {
      await leaveGroup(groupId, userId);
      router.push("/groupes");
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  }

  async function handleDeleteGroup() {
    if (!isOwner) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reading_groups")
        .delete()
        .eq("id", groupId);
      if (error) throw error;
      router.push("/groupes");
    } catch (err) {
      console.error("Error deleting group:", err);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <p className="text-primary-600">Groupe non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/groupes/${groupId}`}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au groupe
        </Link>

        <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-6">
          Paramètres du groupe
        </h1>

        <div className="space-y-6">
          {/* Group info */}
          <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 p-6">
            <h2 className="font-semibold text-primary-800 dark:text-parchment-50 mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-primary-500">Nom</span>
                <p className="text-primary-800 dark:text-parchment-50">{group.name}</p>
              </div>
              {group.description && (
                <div>
                  <span className="text-sm text-primary-500">Description</span>
                  <p className="text-primary-800 dark:text-parchment-50">{group.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invite code */}
          <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 p-6">
            <h2 className="font-semibold text-primary-800 dark:text-parchment-50 mb-4">
              Code d&apos;invitation
            </h2>
            <p className="text-sm text-primary-500 mb-3">
              Partagez ce code pour inviter des membres
            </p>
            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-3 px-4 py-3 bg-parchment-100 dark:bg-primary-800 rounded-xl font-mono text-lg hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
            >
              {group.invite_code}
              {copied ? (
                <Check className="w-5 h-5 text-success-500" />
              ) : (
                <Copy className="w-5 h-5 text-primary-400" />
              )}
            </button>
          </div>

          {/* Leave group */}
          {!isOwner && (
            <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 p-6">
              <h2 className="font-semibold text-primary-800 dark:text-parchment-50 mb-4">
                Quitter le groupe
              </h2>
              <p className="text-sm text-primary-500 mb-4">
                Vous ne pourrez plus voir les défis de ce groupe.
              </p>
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 rounded-lg hover:bg-error-200 dark:hover:bg-error-900/50 transition-colors"
              >
                Quitter le groupe
              </button>
            </div>
          )}

          {/* Delete group (owner only) */}
          {isOwner && (
            <div className="bg-white dark:bg-primary-850 rounded-2xl border border-error-200 dark:border-error-800 p-6">
              <h2 className="font-semibold text-error-600 dark:text-error-400 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Zone dangereuse
              </h2>
              <p className="text-sm text-primary-500 mb-4">
                Supprimer ce groupe supprimera tous les défis et la progression des membres. Cette action est irréversible.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                >
                  Supprimer le groupe
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteGroup}
                    disabled={deleting}
                    className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:bg-error-400 transition-colors"
                  >
                    {deleting ? "Suppression..." : "Confirmer la suppression"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-primary-600 hover:bg-parchment-100 dark:hover:bg-primary-800 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
