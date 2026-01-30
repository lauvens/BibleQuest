"use client";

// Disable static pre-rendering - this page requires client-side auth
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Palette,
  Crown,
  Sparkles,
  Frame,
  KeyRound,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store/user-store";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
  updateUsername,
  getUserCosmetics,
  equipCosmetic,
  unequipCosmetic,
} from "@/lib/supabase/queries";

interface OwnedCosmetic {
  cosmetic_id: string;
  is_equipped: boolean;
  cosmetics: {
    id: string;
    type: string;
    name: string;
    asset_url: string | null;
  };
}

const COSMETIC_ICONS: Record<string, typeof User> = {
  avatar: User,
  frame: Frame,
  title: Sparkles,
  theme: Palette,
};

const COSMETIC_LABELS: Record<string, string> = {
  avatar: "Avatars",
  frame: "Cadres",
  title: "Titres",
  theme: "Thèmes",
};

export default function ParametresPage() {
  const router = useRouter();
  const {
    id: userId,
    isGuest,
    username,
    email,
    setUser,
  } = useUserStore();
  const { showToast } = useToast();

  const [newUsername, setNewUsername] = useState(username || "");
  const [savingUsername, setSavingUsername] = useState(false);

  const [ownedCosmetics, setOwnedCosmetics] = useState<OwnedCosmetic[]>([]);
  const [loadingCosmetics, setLoadingCosmetics] = useState(true);

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isGuest) {
      router.push("/connexion");
      return;
    }
    if (!userId) return;
    setLoadingCosmetics(true);
    getUserCosmetics(userId)
      .then((data) => setOwnedCosmetics(data as OwnedCosmetic[]))
      .catch(() => {})
      .finally(() => setLoadingCosmetics(false));
  }, [userId, isGuest, router]);

  if (isGuest || !userId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-primary-500">Redirection...</p>
      </div>
    );
  }

  const handleSaveUsername = async () => {
    const clean = newUsername.replace(/[^a-zA-Z0-9À-ÿ_-]/g, "").slice(0, 30);
    if (clean.length < 3) {
      showToast("Le nom doit contenir au moins 3 caractères.", "error");
      return;
    }
    setSavingUsername(true);
    try {
      await updateUsername(userId!, clean);
      setUser({ username: clean });
      showToast("Nom d'utilisateur mis à jour!", "success");
    } catch {
      showToast("Ce nom est peut-être déjà pris.", "error");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleEquip = async (cosmeticId: string, type: string) => {
    try {
      await equipCosmetic(userId!, cosmeticId, type);
      setOwnedCosmetics((prev) =>
        prev.map((uc) => ({
          ...uc,
          is_equipped:
            uc.cosmetic_id === cosmeticId
              ? true
              : uc.cosmetics.type === type
                ? false
                : uc.is_equipped,
        }))
      );
      showToast("Cosmétique équipé!", "success");
    } catch {
      showToast("Erreur lors de l'équipement.", "error");
    }
  };

  const handleUnequip = async (cosmeticId: string) => {
    try {
      await unequipCosmetic(userId!, cosmeticId);
      setOwnedCosmetics((prev) =>
        prev.map((uc) =>
          uc.cosmetic_id === cosmeticId ? { ...uc, is_equipped: false } : uc
        )
      );
      showToast("Cosmétique retiré.", "success");
    } catch {
      showToast("Erreur lors du retrait.", "error");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      showToast("Le mot de passe doit contenir au moins 8 caractères.", "error");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showToast("Le mot de passe doit contenir une majuscule.", "error");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      showToast("Le mot de passe doit contenir un chiffre.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast("Mot de passe modifié!", "success");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("Impossible de changer le mot de passe.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Note: full account deletion requires a server-side function
    // For now, we sign out and show a message
    showToast("Contactez le support pour supprimer votre compte.", "error");
    setShowDeleteConfirm(false);
  };

  // Group owned cosmetics by type
  const cosmeticsByType = ownedCosmetics.reduce<Record<string, OwnedCosmetic[]>>(
    (acc, uc) => {
      const type = uc.cosmetics.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(uc);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profil"
          className="p-2 hover:bg-parchment-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary-600" />
        </Link>
        <h1 className="text-2xl font-bold text-primary-800">Paramètres</h1>
      </div>

      {/* Username */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-1">
            Nom d&apos;utilisateur
          </h2>
          <p className="text-sm text-primary-500 mb-4">
            Visible par les autres joueurs dans le classement.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newUsername}
              onChange={(e) =>
                setNewUsername(
                  e.target.value.replace(/[^a-zA-Z0-9À-ÿ_-]/g, "").slice(0, 30)
                )
              }
              className="input flex-1"
              placeholder="Votre nom"
              minLength={3}
              maxLength={30}
            />
            <Button
              onClick={handleSaveUsername}
              disabled={savingUsername || newUsername === username}
              size="sm"
            >
              {savingUsername ? "..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email (read-only) */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-1">Email</h2>
          <p className="text-sm text-primary-400">{email}</p>
        </CardContent>
      </Card>

      {/* Cosmetics */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-1">
            Cosmétiques
          </h2>
          <p className="text-sm text-primary-500 mb-4">
            Équipez les cosmétiques achetés dans la boutique.
          </p>

          {loadingCosmetics ? (
            <p className="text-sm text-primary-400">Chargement...</p>
          ) : ownedCosmetics.length === 0 ? (
            <div className="text-center py-6">
              <Crown className="w-10 h-10 text-primary-300 mx-auto mb-3" />
              <p className="text-primary-500 mb-3">
                Vous n&apos;avez pas encore de cosmétiques.
              </p>
              <Link href="/boutique">
                <Button variant="outline" size="sm">
                  Visiter la boutique
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(COSMETIC_LABELS).map(([type, label]) => {
                const items = cosmeticsByType[type];
                if (!items || items.length === 0) return null;
                const Icon = COSMETIC_ICONS[type] || Sparkles;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-primary-500" />
                      <h3 className="font-medium text-primary-700">{label}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((uc) => (
                        <div
                          key={uc.cosmetic_id}
                          className={`relative p-4 rounded-xl border-2 text-center transition-colors ${
                            uc.is_equipped
                              ? "border-olive-500 bg-olive-50"
                              : "border-parchment-300 bg-parchment-50 hover:border-primary-300"
                          }`}
                        >
                          {uc.is_equipped && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-olive-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
                            <Icon className="w-6 h-6 text-primary-600" />
                          </div>
                          <p className="text-sm font-medium text-primary-800 mb-2">
                            {uc.cosmetics.name}
                          </p>
                          {uc.is_equipped ? (
                            <button
                              onClick={() => handleUnequip(uc.cosmetic_id)}
                              className="text-xs text-primary-500 hover:text-error-600 transition-colors"
                            >
                              Retirer
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleEquip(uc.cosmetic_id, uc.cosmetics.type)
                              }
                              className="text-xs font-medium text-olive-600 hover:underline"
                            >
                              Équiper
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-primary-800">
              Mot de passe
            </h2>
            <KeyRound className="w-5 h-5 text-primary-400" />
          </div>
          {!changingPassword ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangingPassword(true)}
              className="mt-3"
            >
              Changer le mot de passe
            </Button>
          ) : (
            <div className="space-y-3 mt-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full"
                placeholder="Nouveau mot de passe"
                minLength={8}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                placeholder="Confirmer le mot de passe"
                minLength={8}
              />
              <p className="text-xs text-primary-400">
                Minimum 8 caractères, 1 majuscule, 1 chiffre
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  size="sm"
                >
                  {savingPassword ? "..." : "Confirmer"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setChangingPassword(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-error-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-error-600 mb-1">
            Zone dangereuse
          </h2>
          <p className="text-sm text-primary-500 mb-4">
            La suppression de votre compte est irréversible.
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer mon compte
            </Button>
          ) : (
            <div className="bg-error-50 border border-error-200 rounded-xl p-4">
              <p className="text-sm text-error-700 mb-3">
                Êtes-vous sûr ? Toute votre progression sera perdue.
              </p>
              <div className="flex gap-3">
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmer la suppression
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
