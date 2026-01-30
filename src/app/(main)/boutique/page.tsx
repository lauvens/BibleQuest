"use client";

import { useState } from "react";
import { Heart, Coins, Gem, Sparkles, Crown, Palette, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store/user-store";
import { useToast } from "@/components/ui/toast";

type TabType = "hearts" | "cosmetics" | "gems";

// Sample shop items
const heartPackages = [
  { id: "h1", hearts: 1, price: 20, currency: "coins" as const },
  { id: "h2", hearts: 3, price: 50, currency: "coins" as const },
  { id: "h3", hearts: 5, price: 5, currency: "gems" as const },
];

const cosmetics = [
  {
    id: "c1",
    type: "avatar",
    name: "Roi David",
    price: 300,
    currency: "coins" as const,
    icon: User,
  },
  {
    id: "c2",
    type: "frame",
    name: "Couronne d'Or",
    price: 50,
    currency: "gems" as const,
    icon: Crown,
  },
  {
    id: "c3",
    type: "theme",
    name: "Theme Royal",
    price: 150,
    currency: "coins" as const,
    icon: Palette,
  },
  {
    id: "c4",
    type: "title",
    name: "Théologien",
    price: 200,
    currency: "coins" as const,
    icon: Sparkles,
  },
];

const gemPackages = [
  { id: "g1", gems: 50, price: 4.99 },
  { id: "g2", gems: 150, price: 9.99, popular: true },
  { id: "g3", gems: 500, price: 24.99 },
  { id: "g4", gems: 1200, price: 49.99 },
];

export default function BoutiquePage() {
  const [activeTab, setActiveTab] = useState<TabType>("hearts");
  const { coins, gems, getActualHearts, spendCoins, spendGems } = useUserStore();
  const { showToast } = useToast();

  const hearts = getActualHearts();

  const handlePurchase = (
    price: number,
    currency: "coins" | "gems",
    itemName: string
  ) => {
    let success = false;
    if (currency === "coins") {
      success = spendCoins(price);
    } else {
      success = spendGems(price);
    }

    if (success) {
      showToast(`${itemName} acheté avec succès!`, "success");
    } else {
      showToast(`Pas assez de ${currency === "coins" ? "pièces" : "gemmes"}!`, "error");
    }
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
            Vous avez actuellement {hearts}/5 coeurs. Les coeurs se regenerent
            toutes les 30 minutes.
          </p>

          {heartPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {Array.from({ length: pkg.hearts }).map((_, i) => (
                      <Heart
                        key={i}
                        className="w-6 h-6 text-heart fill-heart -ml-1 first:ml-0"
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {pkg.hearts} cœur{pkg.hearts > 1 ? "s" : ""}
                  </span>
                </div>
                <Button
                  onClick={() =>
                    handlePurchase(
                      pkg.price,
                      pkg.currency,
                      `${pkg.hearts} cœur(s)`
                    )
                  }
                  variant={pkg.currency === "gems" ? "secondary" : "primary"}
                  size="sm"
                >
                  {pkg.price}{" "}
                  {pkg.currency === "coins" ? (
                    <Coins className="w-4 h-4 ml-1" />
                  ) : (
                    <Gem className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cosmetics tab */}
      {activeTab === "cosmetics" && (
        <div className="grid grid-cols-2 gap-4">
          {cosmetics.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                </div>
                <h3 className="font-medium text-primary-800 dark:text-parchment-50 mb-1">{item.name}</h3>
                <p className="text-xs text-primary-500 dark:text-primary-400 mb-3 capitalize">
                  {item.type}
                </p>
                <Button
                  onClick={() =>
                    handlePurchase(item.price, item.currency, item.name)
                  }
                  variant={item.currency === "gems" ? "secondary" : "primary"}
                  size="sm"
                  className="w-full"
                >
                  {item.price}{" "}
                  {item.currency === "coins" ? (
                    <Coins className="w-4 h-4 ml-1" />
                  ) : (
                    <Gem className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gems tab */}
      {activeTab === "gems" && (
        <div className="space-y-4">
          <p className="text-primary-600 dark:text-primary-400 mb-4">
            Achetez des gemmes pour debloquer des cosmetiques exclusifs et des
            bonus speciaux.
          </p>

          {gemPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn({
                "ring-2 ring-secondary-500": pkg.popular,
              })}
            >
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
                <Button variant="secondary">
                  {pkg.price.toFixed(2)} EUR
                </Button>
              </CardContent>
            </Card>
          ))}

          <p className="text-xs text-primary-500 dark:text-primary-400 text-center mt-4">
            Les achats en argent reel seront disponibles prochainement via
            Stripe.
          </p>
        </div>
      )}
    </div>
  );
}
