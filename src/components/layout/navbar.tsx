"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/apprendre", label: "Apprendre" },
  { href: "/bible", label: "Bible" },
  { href: "/defi", label: "Défi" },
  { href: "/groupes", label: "Groupes" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isGuest, getActualHearts, currentStreak, coins, gems, username, heartsUpdatedAt } = useUserStore();
  const hearts = getActualHearts();

  return (
    <header className="sticky top-0 z-50 bg-parchment-50/95 dark:bg-primary-900/95 backdrop-blur-sm border-b border-parchment-300 dark:border-primary-800 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="BibleEidó"
            width={44}
            height={44}
            className="shadow-soft group-hover:shadow-card transition-shadow"
          />
          <span className="text-xl font-bold text-primary-700 dark:text-parchment-100 hidden sm:block">
            BibleEidó
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-parchment-100"
                    : "text-primary-500 dark:text-primary-400 hover:bg-parchment-200 dark:hover:bg-primary-800 hover:text-primary-700 dark:hover:text-parchment-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <HeartsDisplay
            hearts={hearts}
            heartsUpdatedAt={heartsUpdatedAt}
            showTimer
          />
          <StreakBadge streak={currentStreak} />
          <CurrencyDisplay coins={coins} gems={gems} />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isGuest ? (
            <>
              <Link href="/connexion">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/inscription">
                <Button size="sm">S&apos;inscrire</Button>
              </Link>
            </>
          ) : (
            <Link href="/profil">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center shadow-soft hover:shadow-card transition-all">
                <span className="text-white font-semibold">
                  {username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
