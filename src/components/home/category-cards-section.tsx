"use client";

import { Target, BookOpen, GraduationCap, ShoppingBag } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { CategoryCard } from "./category-card";

const categories = [
  {
    href: "/defi",
    icon: Target,
    title: "Jouer",
    description: "Testez vos connaissances bibliques",
    gradient: "from-gold-400 to-gold-500",
  },
  {
    href: "/bible",
    icon: BookOpen,
    title: "Lire la Bible",
    description: "Parcourez la Parole de Dieu",
    gradient: "from-accent-400 to-accent-500",
  },
  {
    href: "/apprendre",
    icon: GraduationCap,
    title: "Apprendre",
    description: "Histoire, Contexte, Versets, Doctrines",
    gradient: "from-primary-600 to-primary-700",
  },
  {
    href: "/boutique",
    icon: ShoppingBag,
    title: "Boutique",
    description: "Cosmétiques et bonus",
    gradient: "from-gold-400 via-gold-500 to-accent-400",
  },
];

export function CategoryCardsSection() {
  return (
    <FadeIn delay={0.15} className="mb-12">
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {categories.map((category) => (
          <StaggerItem key={category.href}>
            <CategoryCard {...category} />
          </StaggerItem>
        ))}
      </Stagger>
    </FadeIn>
  );
}
