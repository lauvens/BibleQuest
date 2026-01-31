"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Coins, Gem, Sparkles, Crown, Palette, User, Check, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";
import { useToast } from "@/components/ui/toast";
import { getAllCosmetics, getUserCosmetics, purchaseCosmetic } from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type TabType = "hearts" | "cosmetics" | "gems";
type Cosmetic = Database["public"]["Tables"]["cosmetics"]["Row"];

const heartPackages = [
  { id: "h1", hearts: 1, price: 20, currency: "coins" as const },
  { id: "h2", hearts: 3, price: 50, currency: "coins" as const },
  { id: "h3", hearts: 5, price: 5, currency: "gems" as const },
];

const gemPackages = [
  { id: "g1", gems: 50, price: 4.99 },
  { id: "g2", gems: 150, price: 9.99, popular: true },
  { id: "g3", gems: 500, price: 24.99 },
  { id: "g4", gems: 1200, price: 49.99 },
];

const cosmeticIcons: Record<string, React.ElementType> = {
  avatar: User,
  frame: Crown,
  theme: Palette,
  title: Sparkles,
};

export default function BoutiquePage() {
  const [activeTab, setActiveTab] = useState<TabType>("hearts");
  const { id: userId, isGuest, coins, gems, level, getActualHearts, spendCoins, spendGems, setUser } = useUserStore();
  const { showToast } = useToast();

  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const hearts = getActualHearts();

  const loadCosmetics = useCallback(async () => {
    setLoading(true);
    try {
      const allCosmetics = await getAllCosmetics();
      setCosmetics(allCosmetics);

      if (userId && !isGuest) {
        const userCosmetics = await getUserCosmetics(userId);
        setOwnedIds(new Set(userCosmetics.map((uc) => uc.cosmetic_id)));
      }
    } catch {
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest, showToast]);

  useEffect(() => {
    loadCosmetics();
  }, [loadCosmetics]);

  const handleHeartPurchase = (price: number, currency: "coins" | "gems", heartCount: number) => {
    let success = false;
    if (currency === "coins") {
      success = spendCoins(price);
    } else {
      success = spendGems(price);
    }

    if (success) {
      showToast(`${heartCount} cœur(s) acheté(s)!`, "success");
    } else {
      showToast(`Pas assez de ${currency === "coins" ? "pièces" : "gemmes"}!`, "error");
    }
  };

  const handleCosmeticPurchase = async (cosmetic: Cosmetic) => {
    if (isGuest || !userId) {
      showToast("Connectez-vous pour acheter", "error");
      return;
    }

    if (ownedIds.has(cosmetic.id)) {
      showToast("Déjà possédé", "error");
      return;
    }

    setPurchasing(cosmetic.id);
    try {
      const result = await purchaseCosmetic(userId, cosmetic.id);
      if (result.success) {
        // Update local state
        setOwnedIds((prev) => new Set([...Array.from(prev), cosmetic.id]));
        // Update user store with new balance
        if (cosmetic.unlock_type === "coins") {
          setUser({ coins: coins - cosmetic.unlock_value });
        } else if (cosmetic.unlock_type === "gems") {
          setUser({ gems: gems - cosmetic.unlock_value });
        }
        showToast(`${cosmetic.name} acheté!`, "success");
      } else {
        showToast(result.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur lors de l'achat", "error");
    } finally {
      setPurchasing(null);
    }
  };

  const canPurchase = (cosmetic: Cosmetic): boolean => {
    if (ownedIds.has(cosmetic.id)) return false;
    if (cosmetic.unlock_type === "free") return true;
    if (cosmetic.unlock_type === "level") return level >= cosmetic.unlock_value;
    if (cosmetic.unlock_type === "coins") return coins >= cosmetic.unlock_value;
    if (cosmetic.unlock_type === "gems") return gems >= cosmetic.unlock_value;
    return false;
  };

  const isLocked = (cosmetic: Cosmetic): boolean => {
    if (cosmetic.unlock_type === "level" && level < cosmetic.unlock_value) return true;
    return false;
  };

  const groupedCosmetics = cosmetics.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {} as Record<string, Cosmetic[]>);

  const typeLabels: Record<string, string> = {
    avatar: "Avatars",
    frame: "Cadres",
    title: "Titres",
    theme: "Thèmes",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2">Boutique</h1>

      {/* Currency display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gold-100 dark:bg-gold-900/40 px-4 py-2 rounded-full">
          <Coins className="w-5 h-5 text-gold-500 dark:text-gold-400" />
          <span className="font-bold text-gold-600 dark:text-gold-300">{coins}</span>
        </div>
        <div className="flex items-center gap-2 bg-info-100 dark:bg-info-900/40 px-4 py-2 rounded-full">
          <Gem className="w-5 h-5 text-info-500 dark:text-info-400" />
          <span className="font-bold text-info-600 dark:text-info-300">{gems}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "hearts", label: "Cœurs", icon: Heart },
          { value: "cosmetics", label: "Cosmétiques", icon: Sparkles },
          { value: "gems", label: "Gemmes", icon: Gem },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as TabType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              {
                "bg-primary-600 dark:bg-primary-500 text-white": activeTab === tab.value,
                "bg-parchment-200 dark:bg-primary-800 text-primary-600 dark:text-primary-300 hover:bg-parchment-300 dark:hover:bg-primary-700":
                  activeTab !== tab.value,
              }
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hearts tab */}
      {activeTab === "hearts" && (
        <div className="space-y-4">
          <p className="text-primary-600 dark:text-primary-400 mb-4">
            Vous avez actuellement {hearts}/5 cœurs. Les cœurs se régénèrent toutes les 30 minutes.
          </p>

          {heartPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {Array.from({ length: pkg.hearts }).map((_, i) => (
                      <Heart key={i} className="w-6 h-6 text-heart fill-heart -ml-1 first:ml-0" />
                    ))}
                  </div>
                  <span className="font-medium">{pkg.hearts} cœur{pkg.hearts > 1 ? "s" : ""}</span>
                </div>
                <Button
                  onClick={() => handleHeartPurchase(pkg.price, pkg.currency, pkg.hearts)}
                  variant={pkg.currency === "gems" ? "secondary" : "primary"}
                  size="sm"
                >
                  {pkg.price}{" "}
                  {pkg.currency === "coins" ? <Coins className="w-4 h-4 ml-1" /> : <Gem className="w-4 h-4 ml-1" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cosmetics tab */}
      {activeTab === "cosmetics" && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 h-40" />
                </Card>
              ))}
            </div>
          ) : (
            Object.entries(groupedCosmetics).map(([type, items]) => (
              <div key={type}>
                <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-3">
                  {typeLabels[type] || type}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {items.map((item) => {
                    const Icon = cosmeticIcons[item.type] || Sparkles;
                    const owned = ownedIds.has(item.id);
                    const locked = isLocked(item);
                    const canBuy = canPurchase(item);

                    return (
                      <Card key={item.id} className={cn({ "opacity-60": locked })}>
                        <CardContent className="p-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-3 relative">
                            <Icon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                            {owned && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {locked && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center">
                                <Lock className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-primary-800 dark:text-parchment-50 mb-1">{item.name}</h3>

                          {owned ? (
                            <p className="text-xs text-success-600 dark:text-success-400 mb-3">Possédé</p>
                          ) : locked ? (
                            <p className="text-xs text-primary-500 dark:text-primary-400 mb-3">
                              Niveau {item.unlock_value} requis
                            </p>
                          ) : item.unlock_type === "free" ? (
                            <p className="text-xs text-success-600 dark:text-success-400 mb-3">Gratuit</p>
                          ) : (
                            <p className="text-xs text-primary-500 dark:text-primary-400 mb-3">
                              {item.unlock_value} {item.unlock_type === "coins" ? "pièces" : "gemmes"}
                            </p>
                          )}

                          {!owned && !locked && (
                            <Button
                              onClick={() => handleCosmeticPurchase(item)}
                              disabled={!canBuy || purchasing === item.id || isGuest}
                              variant={item.unlock_type === "gems" ? "secondary" : "primary"}
                              size="sm"
                              className="w-full"
                            >
                              {purchasing === item.id ? (
                                "..."
                              ) : item.unlock_type === "free" ? (
                                "Obtenir"
                              ) : (
                                <>
                                  {item.unlock_value}{" "}
                                  {item.unlock_type === "coins" ? (
                                    <Coins className="w-4 h-4 ml-1" />
                                  ) : (
                                    <Gem className="w-4 h-4 ml-1" />
                                  )}
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {isGuest && (
            <p className="text-center text-primary-500 dark:text-primary-400 text-sm">
              Connectez-vous pour acheter des cosmétiques.
            </p>
          )}
        </div>
      )}

      {/* Gems tab */}
      {activeTab === "gems" && (
        <div className="space-y-4">
          <p className="text-primary-600 dark:text-primary-400 mb-4">
            Achetez des gemmes pour débloquer des cosmétiques exclusifs et des bonus spéciaux.
          </p>

          {gemPackages.map((pkg) => (
            <Card key={pkg.id} className={cn({ "ring-2 ring-secondary-500": pkg.popular })}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-info-100 dark:bg-info-900/40 flex items-center justify-center">
                    <Gem className="w-6 h-6 text-info-500 dark:text-info-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-primary-800 dark:text-parchment-50">{pkg.gems}</span>
                      <span className="text-primary-500 dark:text-primary-400">gemmes</span>
                      {pkg.popular && (
                        <span className="bg-info-500 dark:bg-info-600 text-white text-xs px-2 py-0.5 rounded-full">
                          Populaire
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="secondary">{pkg.price.toFixed(2)} EUR</Button>
              </CardContent>
            </Card>
          ))}

          <p className="text-xs text-primary-500 dark:text-primary-400 text-center mt-4">
            Les achats en argent réel seront disponibles prochainement via Stripe.
          </p>
        </div>
      )}
    </div>
  );
}
