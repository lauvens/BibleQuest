"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Book, Target, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/apprendre", icon: BookOpen, label: "Apprendre" },
  { href: "/bible", icon: Book, label: "Bible" },
  { href: "/defi", icon: Target, label: "Défi" },
  { href: "/groupes", icon: Users, label: "Groupes" },
  { href: "/profil", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-parchment-50/95 backdrop-blur-sm border-t border-parchment-300 md:hidden shadow-[0_-2px_10px_rgba(166,124,91,0.08)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                {
                  "text-olive-600 bg-olive-50": isActive,
                  "text-primary-400 hover:text-primary-600 hover:bg-parchment-200": !isActive,
                }
              )}
            >
              <item.icon className={cn("w-6 h-6", { "stroke-[2.5px]": isActive })} />
              <span className={cn("text-[10px] font-medium", { "font-semibold": isActive })}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
