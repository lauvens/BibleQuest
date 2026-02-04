# Cosmetics System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a complete cosmetics system with seed data, purchase persistence, inventory management, and profile display.

**Architecture:** Cosmetics are stored in the `cosmetics` table, user purchases in `user_cosmetics`. The boutique fetches from DB, purchases are validated server-side and persisted. Profile displays equipped avatar/frame/title.

**Tech Stack:** Next.js, Supabase, Zustand, TypeScript

---

## Task 1: Seed Cosmetics Data

**Files:**
- Create: `supabase/migrations/00003_seed_cosmetics.sql`

**Step 1: Create migration with cosmetic items**

```sql
-- Seed cosmetics data
-- Avatars (type: avatar)
INSERT INTO cosmetics (id, type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('avatar-default', 'avatar', 'Défaut', NULL, 'free', 0, true),
  ('avatar-david', 'avatar', 'Roi David', '/avatars/david.png', 'coins', 300, true),
  ('avatar-moses', 'avatar', 'Moïse', '/avatars/moses.png', 'coins', 300, true),
  ('avatar-esther', 'avatar', 'Esther', '/avatars/esther.png', 'coins', 300, true),
  ('avatar-paul', 'avatar', 'Paul', '/avatars/paul.png', 'gems', 25, true),
  ('avatar-mary', 'avatar', 'Marie', '/avatars/mary.png', 'gems', 25, true);

-- Frames (type: frame)
INSERT INTO cosmetics (id, type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('frame-none', 'frame', 'Aucun', NULL, 'free', 0, true),
  ('frame-gold', 'frame', 'Couronne d''Or', '/frames/gold.png', 'gems', 50, true),
  ('frame-silver', 'frame', 'Argent', '/frames/silver.png', 'coins', 200, true),
  ('frame-bronze', 'frame', 'Bronze', '/frames/bronze.png', 'coins', 100, true),
  ('frame-fire', 'frame', 'Flammes', '/frames/fire.png', 'level', 10, true),
  ('frame-divine', 'frame', 'Lumière Divine', '/frames/divine.png', 'gems', 100, true);

-- Titles (type: title)
INSERT INTO cosmetics (id, type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('title-none', 'title', 'Aucun', NULL, 'free', 0, true),
  ('title-disciple', 'title', 'Disciple', NULL, 'free', 0, true),
  ('title-theologian', 'title', 'Théologien', NULL, 'coins', 200, true),
  ('title-scholar', 'title', 'Érudit', NULL, 'coins', 150, true),
  ('title-prophet', 'title', 'Prophète', NULL, 'level', 15, true),
  ('title-apostle', 'title', 'Apôtre', NULL, 'gems', 75, true);

-- Themes (type: theme)
INSERT INTO cosmetics (id, type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  ('theme-default', 'theme', 'Parchemin', NULL, 'free', 0, true),
  ('theme-royal', 'theme', 'Royal', NULL, 'coins', 150, true),
  ('theme-ocean', 'theme', 'Océan', NULL, 'coins', 150, true),
  ('theme-forest', 'theme', 'Forêt', NULL, 'coins', 150, true),
  ('theme-sunset', 'theme', 'Crépuscule', NULL, 'gems', 40, true),
  ('theme-midnight', 'theme', 'Minuit', NULL, 'gems', 40, true);
```

**Step 2: Apply migration to Supabase**

Run: Apply via Supabase dashboard or `supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/00003_seed_cosmetics.sql
git commit -m "feat: seed cosmetics data with avatars, frames, titles, themes"
```

---

## Task 2: Add Purchase Query

**Files:**
- Modify: `src/lib/supabase/queries.ts`

**Step 1: Add purchaseCosmetic function**

Add after the `unequipCosmetic` function (around line 407):

```typescript
// Purchase a cosmetic (deduct currency and add to user_cosmetics)
export async function purchaseCosmetic(
  userId: string,
  cosmeticId: string
): Promise<{ success: boolean; error?: string }> {
  // Get the cosmetic details
  const { data: cosmetic, error: cosmeticError } = await supabase()
    .from("cosmetics")
    .select("*")
    .eq("id", cosmeticId)
    .eq("is_active", true)
    .single();

  if (cosmeticError || !cosmetic) {
    return { success: false, error: "Cosmétique introuvable" };
  }

  // Check if already owned
  const { data: existing } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id")
    .eq("user_id", userId)
    .eq("cosmetic_id", cosmeticId)
    .single();

  if (existing) {
    return { success: false, error: "Déjà possédé" };
  }

  // Get user's current balance
  const { data: user, error: userError } = await supabase()
    .from("users")
    .select("coins, gems, level")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return { success: false, error: "Utilisateur introuvable" };
  }

  // Check unlock requirements
  const unlockType = cosmetic.unlock_type as string;
  const unlockValue = cosmetic.unlock_value as number;

  if (unlockType === "level" && user.level < unlockValue) {
    return { success: false, error: `Niveau ${unlockValue} requis` };
  }

  if (unlockType === "coins" && user.coins < unlockValue) {
    return { success: false, error: "Pas assez de pièces" };
  }

  if (unlockType === "gems" && user.gems < unlockValue) {
    return { success: false, error: "Pas assez de gemmes" };
  }

  // Deduct currency if needed
  if (unlockType === "coins") {
    const { error } = await supabase()
      .from("users")
      .update({ coins: user.coins - unlockValue })
      .eq("id", userId);
    if (error) return { success: false, error: "Erreur de paiement" };
  } else if (unlockType === "gems") {
    const { error } = await supabase()
      .from("users")
      .update({ gems: user.gems - unlockValue })
      .eq("id", userId);
    if (error) return { success: false, error: "Erreur de paiement" };
  }

  // Add to user_cosmetics
  const { error: insertError } = await supabase()
    .from("user_cosmetics")
    .insert({
      user_id: userId,
      cosmetic_id: cosmeticId,
      is_equipped: false,
    });

  if (insertError) {
    return { success: false, error: "Erreur lors de l'achat" };
  }

  return { success: true };
}

// Get user's equipped cosmetics
export async function getUserEquippedCosmetics(userId: string) {
  const { data, error } = await supabase()
    .from("user_cosmetics")
    .select("cosmetic_id, cosmetics(*)")
    .eq("user_id", userId)
    .eq("is_equipped", true);
  if (error) throw error;

  const result: Record<string, Tables["cosmetics"]["Row"]> = {};
  (data ?? []).forEach((uc) => {
    const cosmetic = uc.cosmetics as unknown as Tables["cosmetics"]["Row"];
    if (cosmetic) {
      result[cosmetic.type] = cosmetic;
    }
  });
  return result;
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase/queries.ts
git commit -m "feat: add purchaseCosmetic and getUserEquippedCosmetics queries"
```

---

## Task 3: Update Boutique Page

**Files:**
- Modify: `src/app/(main)/boutique/page.tsx`

**Step 1: Replace hardcoded cosmetics with DB fetch**

Replace the entire file with:

```tsx
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
        setOwnedIds((prev) => new Set([...prev, cosmetic.id]));
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
```

**Step 2: Commit**

```bash
git add src/app/(main)/boutique/page.tsx
git commit -m "feat: update boutique to fetch cosmetics from DB with purchase persistence"
```

---

## Task 4: Create Cosmetics Inventory Page

**Files:**
- Create: `src/app/(main)/profil/cosmetiques/page.tsx`

**Step 1: Create the inventory page**

```tsx
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
              Vous n'avez pas encore de cosmétiques.
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
```

**Step 2: Commit**

```bash
git add src/app/(main)/profil/cosmetiques/page.tsx
git commit -m "feat: add cosmetics inventory page with equip/unequip"
```

---

## Task 5: Update Profile Page with Equipped Cosmetics

**Files:**
- Modify: `src/app/(main)/profil/page.tsx`

**Step 1: Add equipped cosmetics display**

Add import at top:
```typescript
import { getUserEquippedCosmetics } from "@/lib/supabase/queries";
```

Add state after existing state declarations (around line 69):
```typescript
const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
```

Update `loadProfile` function to also load equipped cosmetics:
```typescript
const loadProfile = async () => {
  if (!userId || isGuest) return;
  setError(false);
  try {
    const [statsData, achievementsData, equippedData] = await Promise.all([
      getUserStats(userId),
      getUserAchievements(userId),
      getUserEquippedCosmetics(userId),
    ]);
    setStats(statsData);
    setAchievements(
      achievementsData.map((a) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        unlocked: a.unlocked,
      }))
    );
    if (equippedData.title) {
      setEquippedTitle(equippedData.title.name);
    }
  } catch {
    setError(true);
  }
};
```

Update the profile header section to show the title (replace username display around line 189):
```tsx
<div>
  <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
    {username || "Utilisateur"}
  </h1>
  {equippedTitle && (
    <p className="text-sm text-gold-600 dark:text-gold-400 font-medium">
      {equippedTitle}
    </p>
  )}
  <p className="text-primary-500 dark:text-primary-400">{email}</p>
</div>
```

Add link to cosmetics page in quick actions (after boutique link around line 293):
```tsx
<Link href="/profil/cosmetiques">
  <Button variant="outline" className="w-full justify-start">
    <Sparkles className="w-5 h-5 mr-3" />
    Mes cosmétiques
  </Button>
</Link>
```

Add Sparkles import at top:
```typescript
import { Sparkles } from "lucide-react";
```

**Step 2: Commit**

```bash
git add src/app/(main)/profil/page.tsx
git commit -m "feat: display equipped title on profile and add cosmetics link"
```

---

## Task 6: Verify Build

**Step 1: Run build**

```bash
npm run build
```

Expected: Build passes with no errors.

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete cosmetics system implementation"
```

---

## Verification Checklist

1. [ ] Migration creates cosmetics seed data
2. [ ] `purchaseCosmetic` validates and persists purchases
3. [ ] Boutique loads cosmetics from database
4. [ ] Boutique shows owned status correctly
5. [ ] Cosmetics inventory page shows owned items
6. [ ] Equip/unequip works correctly
7. [ ] Profile shows equipped title
8. [ ] Profile has link to cosmetics page
9. [ ] `npm run build` passes

---

## File Summary

| Action | File |
|--------|------|
| Create | `supabase/migrations/00003_seed_cosmetics.sql` |
| Modify | `src/lib/supabase/queries.ts` |
| Modify | `src/app/(main)/boutique/page.tsx` |
| Create | `src/app/(main)/profil/cosmetiques/page.tsx` |
| Modify | `src/app/(main)/profil/page.tsx` |
