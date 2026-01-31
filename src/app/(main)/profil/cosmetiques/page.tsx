"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, User, Crown, Palette, Sparkles, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";
import { useToast } from "@/components/ui/toast";
import { getUserCosmetics, equipCosmetic, unequipCosmetic } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type Cosmetic = Database["public"]["Tables"]["cosmetics"]["Row"];
type UserCosmetic = {
  cosmetic_id: string;
  is_equipped: boolean;
  cosmetics: Cosmetic;
};

const cosmeticIcons: Record<string, React.ElementType> = {
  avatar: User,
  frame: Crown,
  theme: Palette,
  title: Sparkles,
};

const typeLabels: Record<string, string> = {
  avatar: "Avatars",
  frame: "Cadres",
  title: "Titres",
  theme: "Thèmes",
};

export default function CosmetiquesPage() {
  const { id: userId, isGuest } = useUserStore();
  const { showToast } = useToast();

  const [cosmetics, setCosmetics] = useState<UserCosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadCosmetics = useCallback(async () => {
    if (!userId || isGuest) return;
    setLoading(true);
    try {
      const data = await getUserCosmetics(userId);
      setCosmetics(data);
    } catch {
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest, showToast]);

  useEffect(() => {
    loadCosmetics();
  }, [loadCosmetics]);

  const handleToggleEquip = async (userCosmetic: UserCosmetic) => {
    if (!userId) return;

    setToggling(userCosmetic.cosmetic_id);
    try {
      if (userCosmetic.is_equipped) {
        await unequipCosmetic(userId, userCosmetic.cosmetic_id);
      } else {
        await equipCosmetic(userId, userCosmetic.cosmetic_id, userCosmetic.cosmetics.type);
      }
      // Reload to get updated state
      await loadCosmetics();
      showToast(
        userCosmetic.is_equipped ? "Déséquipé" : "Équipé!",
        "success"
      );
    } catch {
      showToast("Erreur", "error");
    } finally {
      setToggling(null);
    }
  };

  const groupedCosmetics = cosmetics.reduce((acc, uc) => {
    const type = uc.cosmetics.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(uc);
    return acc;
  }, {} as Record<string, UserCosmetic[]>);

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/profil"
          className="inline-flex items-center text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Profil
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-primary-600 dark:text-primary-400">
              Connectez-vous pour gérer vos cosmétiques.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/profil"
        className="inline-flex items-center text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Profil
      </Link>

      <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-6">
        Mes Cosmétiques
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-40" />
            </Card>
          ))}
        </div>
      ) : cosmetics.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              Vous n&apos;avez pas encore de cosmétiques.
            </p>
            <Link href="/boutique">
              <Button>Visiter la boutique</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedCosmetics).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-3">
                {typeLabels[type] || type}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {items.map((uc) => {
                  const Icon = cosmeticIcons[uc.cosmetics.type] || Sparkles;
                  return (
                    <Card
                      key={uc.cosmetic_id}
                      className={cn({
                        "ring-2 ring-success-500": uc.is_equipped,
                      })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-3 relative">
                          <Icon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                          {uc.is_equipped && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-primary-800 dark:text-parchment-50 mb-3">
                          {uc.cosmetics.name}
                        </h3>
                        <Button
                          onClick={() => handleToggleEquip(uc)}
                          disabled={toggling === uc.cosmetic_id}
                          variant={uc.is_equipped ? "outline" : "primary"}
                          size="sm"
                          className="w-full"
                        >
                          {toggling === uc.cosmetic_id
                            ? "..."
                            : uc.is_equipped
                            ? "Déséquiper"
                            : "Équiper"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/boutique">
          <Button variant="outline" className="w-full">
            Visiter la boutique
          </Button>
        </Link>
      </div>
    </div>
  );
}
