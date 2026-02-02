# Homepage Redesign - Bible Project Style with Animations

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign homepage with Bible Project-style layout, generous whitespace, large cards with visual hierarchy, and professional animations using Framer Motion.

**Architecture:** Replace cluttered current layout with clean sections: Hero (current progress), Recommended Courses (large cards), Daily Verse (with streak), and Explorer section. Add smooth entrance animations and micro-interactions.

**Tech Stack:** Next.js 14, Framer Motion, Tailwind CSS, existing component library

---

## Current State Analysis

### Current Homepage Elements (to keep/modify):
- ✅ Welcome message with username
- ✅ XP progress bar (XpBar component)
- ✅ Streak badge (StreakBadge component)
- ✅ Currency display (coins/gems)
- ✅ Daily verse section
- ✅ Bible reader CTA
- ✅ Daily challenge CTA

### Current Elements to Remove:
- ❌ Mobile stats grid (redundant with hero)
- ❌ Small category cards (4 small squares)
- ❌ Leaderboard preview card
- ❌ Hearts display (moved to nav/profile)

### New Layout Structure:
```
┌────────────────────────────────────────────────────────┐
│ 🔥 HERO SECTION - Current Progress                     │
│ ┌────────────────────────────────────────────────────┐ │
│ │  Welcome back, [Username]!                         │ │
│ │  [XP Progress Bar - large]                         │ │
│ │  🔥 7 jours · 💰 250 · 💎 12                       │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ 📚 PARCOURS RECOMMANDÉS (Large Cards with Thumbnails)  │
│ ┌─────────────────┐  ┌─────────────────┐              │
│ │    [Thumbnail]  │  │    [Thumbnail]  │              │
│ │                 │  │                 │              │
│ │  Comprendre     │  │  Les Psaumes    │              │
│ │  la Genèse      │  │                 │              │
│ │  ──────── 40%   │  │  ──────── New   │              │
│ └─────────────────┘  └─────────────────┘              │
├────────────────────────────────────────────────────────┤
│ 📖 VERSET DU JOUR (Clean, centered)                    │
│ ┌────────────────────────────────────────────────────┐ │
│ │  "Ta parole est une lampe à mes pieds..."          │ │
│ │                    — Psaume 119:105                 │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ 🧭 EXPLORER (3 cards grid)                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ 📖 Bible │ │ 🎯 Défi  │ │ 🏆 Class.│                │
│ │ Lire     │ │ Quotidien│ │          │                │
│ └──────────┘ └──────────┘ └──────────┘                │
└────────────────────────────────────────────────────────┘
```

---

## Phase 1: Install Framer Motion

### Task 1: Add Framer Motion dependency

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion**

Run: `npm install framer-motion`

**Step 2: Verify installation**

Run: `npm ls framer-motion`
Expected: `framer-motion@11.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion for animations"
```

---

## Phase 2: Create Animation Components

### Task 2: Create reusable animation components

**Files:**
- Create: `src/components/ui/motion.tsx`

**Step 1: Create the motion component file**

```tsx
"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// Fade up animation for sections
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Scale on hover for cards
export const cardHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Fade in section wrapper
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

// Stagger container for lists
interface StaggerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )
);
Stagger.displayName = "Stagger";

// Stagger item (child of Stagger)
export const StaggerItem = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = "StaggerItem";

// Interactive card with hover effect
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
MotionCard.displayName = "MotionCard";
```

**Step 2: Verify file builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ui/motion.tsx
git commit -m "feat: add reusable animation components with framer-motion"
```

---

## Phase 3: Create Course Card Component

### Task 3: Create large course card with thumbnail

**Files:**
- Create: `src/components/courses/course-card.tsx`

**Step 1: Create the course card component**

```tsx
"use client";

import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { MotionCard } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  progress?: number; // 0-100
  isNew?: boolean;
  moduleCount?: number;
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  progress,
  isNew,
  moduleCount,
}: CourseCardProps) {
  const hasProgress = typeof progress === "number" && progress > 0;

  return (
    <Link href={`/parcours/${id}`}>
      <MotionCard className="group h-full">
        <div className="rounded-2xl overflow-hidden bg-parchment-50 dark:bg-primary-800 border border-parchment-300 dark:border-primary-700 shadow-card hover:shadow-elevated transition-shadow">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-accent-400 to-accent-600 dark:from-accent-500 dark:to-accent-700">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/80" />
              </div>
            )}
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-elevated">
                <Play className="w-6 h-6 text-primary-800 ml-1" />
              </div>
            </div>
            {/* New badge */}
            {isNew && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold-400 text-primary-900 text-xs font-bold">
                Nouveau
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-primary-800 dark:text-parchment-50 mb-1 line-clamp-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-primary-500 dark:text-primary-400 mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Progress bar or module count */}
            {hasProgress ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-primary-500 dark:text-primary-400">Progression</span>
                  <span className="font-medium text-accent-600 dark:text-accent-400">{progress}%</span>
                </div>
                <div className="h-2 bg-parchment-300 dark:bg-primary-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : moduleCount ? (
              <p className="text-xs text-primary-400 dark:text-primary-500">
                {moduleCount} modules
              </p>
            ) : null}
          </div>
        </div>
      </MotionCard>
    </Link>
  );
}
```

**Step 2: Verify file builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/courses/course-card.tsx
git commit -m "feat: add CourseCard component with thumbnail and progress"
```

---

## Phase 4: Create Hero Section Component

### Task 4: Create hero section with progress

**Files:**
- Create: `src/components/home/hero-section.tsx`

**Step 1: Create the hero section component**

```tsx
"use client";

import { Flame, Coins, Gem } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { XpBar } from "@/components/game/xp-bar";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  username?: string;
  isGuest: boolean;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
}

export function HeroSection({
  username,
  isGuest,
  xp,
  level,
  coins,
  gems,
  streak,
}: HeroSectionProps) {
  return (
    <FadeIn className="mb-12">
      <div className="rounded-3xl bg-gradient-to-br from-primary-800 to-primary-900 dark:from-primary-900 dark:to-primary-850 p-8 text-white shadow-elevated">
        {/* Welcome */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isGuest ? "Bienvenue sur BibleEidó!" : `Bonjour, ${username || "Ami"}!`}
        </h1>
        <p className="text-white/70 mb-6">
          {isGuest
            ? "Commencez votre voyage biblique"
            : "Continuez votre apprentissage"}
        </p>

        {/* XP Progress - Large */}
        <div className="mb-6">
          <XpBar xp={xp} level={level} variant="light" />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Streak */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            streak > 0
              ? "bg-gold-400/20 border border-gold-400/30"
              : "bg-white/10 border border-white/10"
          )}>
            <Flame className={cn(
              "w-5 h-5",
              streak > 0 ? "text-gold-400 fill-gold-400" : "text-white/50"
            )} />
            <span className="font-semibold">{streak} jours</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Coins className="w-5 h-5 text-gold-400" />
            <span className="font-semibold">{coins}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Gem className="w-5 h-5 text-accent-400" />
            <span className="font-semibold">{gems}</span>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
```

**Step 2: Update XpBar to support light variant**

**Files:**
- Modify: `src/components/game/xp-bar.tsx`

Read the current XpBar file first, then add a `variant` prop that changes colors for dark backgrounds.

**Step 3: Verify file builds**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/home/hero-section.tsx src/components/game/xp-bar.tsx
git commit -m "feat: add HeroSection component with XP progress and stats"
```

---

## Phase 5: Create Daily Verse Section

### Task 5: Create clean daily verse component

**Files:**
- Create: `src/components/home/daily-verse-section.tsx`

**Step 1: Create the daily verse section**

```tsx
"use client";

import Link from "next/link";
import { BookOpen, Book, Share2 } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

interface DailyVerseSectionProps {
  verse: {
    text: string;
    reference: string;
  } | null;
}

const defaultVerse = {
  text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
  reference: "Psaume 119:105",
};

export function DailyVerseSection({ verse }: DailyVerseSectionProps) {
  const displayVerse = verse || defaultVerse;

  const handleShare = async () => {
    const text = `"${displayVerse.text}" — ${displayVerse.reference}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <FadeIn delay={0.3} className="mb-12">
      <div className="text-center py-12 px-6 rounded-3xl bg-parchment-100 dark:bg-primary-850 border border-parchment-300 dark:border-primary-700">
        <p className="text-xs uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-4">
          Verset du jour
        </p>
        <blockquote className="text-xl md:text-2xl font-serif italic text-primary-800 dark:text-parchment-50 max-w-2xl mx-auto mb-4 leading-relaxed">
          &ldquo;{displayVerse.text}&rdquo;
        </blockquote>
        <cite className="text-primary-500 dark:text-primary-400 not-italic font-medium">
          — {displayVerse.reference}
        </cite>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-8">
          <Link href="/versets">
            <Button variant="outline" size="sm">
              <Book className="w-4 h-4 mr-2" />
              Mes versets
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
```

**Step 2: Verify file builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/home/daily-verse-section.tsx
git commit -m "feat: add DailyVerseSection component with share functionality"
```

---

## Phase 6: Create Explorer Section

### Task 6: Create explorer cards section

**Files:**
- Create: `src/components/home/explorer-section.tsx`

**Step 1: Create the explorer section**

```tsx
"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy } from "lucide-react";
import { FadeIn, Stagger, StaggerItem, MotionCard } from "@/components/ui/motion";

const explorerItems = [
  {
    href: "/bible",
    icon: BookOpen,
    title: "Bible",
    description: "Lire la Parole",
    gradient: "from-gold-400 to-gold-500",
  },
  {
    href: "/defi",
    icon: Target,
    title: "Défi Quotidien",
    description: "10 questions",
    gradient: "from-accent-400 to-accent-500",
  },
  {
    href: "/classement",
    icon: Trophy,
    title: "Classement",
    description: "Compétition",
    gradient: "from-primary-600 to-primary-700",
  },
];

export function ExplorerSection() {
  return (
    <FadeIn delay={0.4} className="mb-12">
      <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-4">
        Explorer
      </h2>
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {explorerItems.map((item) => (
          <StaggerItem key={item.href}>
            <Link href={item.href}>
              <MotionCard>
                <div className="rounded-2xl overflow-hidden bg-parchment-50 dark:bg-primary-800 border border-parchment-300 dark:border-primary-700 shadow-card hover:shadow-elevated transition-shadow">
                  <div className={`h-24 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary-800 dark:text-parchment-50">
                      {item.title}
                    </h3>
                    <p className="text-sm text-primary-500 dark:text-primary-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </MotionCard>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </FadeIn>
  );
}
```

**Step 2: Verify file builds**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/home/explorer-section.tsx
git commit -m "feat: add ExplorerSection with animated cards"
```

---

## Phase 7: Rewrite Homepage

### Task 7: Rebuild the homepage with new components

**Files:**
- Modify: `src/app/(main)/page.tsx`

**Step 1: Replace homepage content**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home/hero-section";
import { CourseCard } from "@/components/courses/course-card";
import { DailyVerseSection } from "@/components/home/daily-verse-section";
import { ExplorerSection } from "@/components/home/explorer-section";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { useUserStore } from "@/lib/store/user-store";
import { getDailyVerse } from "@/lib/supabase/queries";

// Placeholder courses until database is ready
const placeholderCourses = [
  {
    id: "genesis",
    title: "Comprendre la Genèse",
    description: "Les fondements de la Bible",
    progress: 40,
    moduleCount: 8,
  },
  {
    id: "psalms",
    title: "Les Psaumes",
    description: "Poésie et louange",
    isNew: true,
    moduleCount: 12,
  },
  {
    id: "gospels",
    title: "Les Évangiles",
    description: "La vie de Jésus",
    moduleCount: 10,
  },
];

export default function HomePage() {
  const {
    isGuest,
    username,
    xp,
    level,
    coins,
    gems,
    currentStreak,
  } = useUserStore();

  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  useEffect(() => {
    getDailyVerse()
      .then(setVerse)
      .catch(() => null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <HeroSection
        username={username}
        isGuest={isGuest}
        xp={xp}
        level={level}
        coins={coins}
        gems={gems}
        streak={currentStreak}
      />

      {/* Recommended Courses */}
      <FadeIn delay={0.1} className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50">
            Parcours recommandés
          </h2>
          <Link
            href="/parcours"
            className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Voir tout
          </Link>
        </div>
        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderCourses.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                progress={course.progress}
                isNew={course.isNew}
                moduleCount={course.moduleCount}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>

      {/* Daily Verse */}
      <DailyVerseSection verse={verse} />

      {/* Explorer */}
      <ExplorerSection />

      {/* Guest CTA */}
      {isGuest && (
        <FadeIn delay={0.5}>
          <div className="rounded-3xl border-2 border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mb-4 max-w-md mx-auto">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button size="lg">Créer un compte gratuit</Button>
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
```

**Step 2: Verify the build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "feat: redesign homepage with Bible Project style and animations"
```

---

## Phase 8: Update XpBar for Light Variant

### Task 8: Add light variant to XpBar

**Files:**
- Modify: `src/components/game/xp-bar.tsx`

**Step 1: Read current XpBar implementation**

Read the file to understand current structure.

**Step 2: Add variant prop**

Add a `variant?: "default" | "light"` prop that changes the background and text colors to work on dark backgrounds.

**Step 3: Verify the build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/game/xp-bar.tsx
git commit -m "feat: add light variant to XpBar for dark backgrounds"
```

---

## Phase 9: Final Polish

### Task 9: Test and polish animations

**Step 1: Run development server**

Run: `npm run dev`

**Step 2: Test on different screen sizes**

- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)

**Step 3: Verify animations are smooth**

- Hero fades in on load
- Course cards stagger in
- Cards hover/tap effect works
- Daily verse fades in after courses
- Explorer cards stagger in

**Step 4: Final build test**

Run: `npm run build`
Expected: Build succeeds with no warnings

**Step 5: Final commit and push**

```bash
git add -A
git commit -m "polish: finalize homepage redesign with animations"
git push
```

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `src/components/ui/motion.tsx` | Reusable Framer Motion animation components |
| `src/components/courses/course-card.tsx` | Large course card with thumbnail and progress |
| `src/components/home/hero-section.tsx` | Hero with XP progress and stats |
| `src/components/home/daily-verse-section.tsx` | Clean centered daily verse |
| `src/components/home/explorer-section.tsx` | 3-card explorer grid |

## Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add framer-motion dependency |
| `src/components/game/xp-bar.tsx` | Add light variant prop |
| `src/app/(main)/page.tsx` | Complete redesign with new components |

---

## Testing Checklist

- [ ] Animations work on page load
- [ ] Hover effects on cards
- [ ] Mobile responsive layout
- [ ] Dark mode colors correct
- [ ] Guest CTA appears when not logged in
- [ ] XP bar displays correctly in hero
- [ ] Daily verse shows (or fallback)
- [ ] All links work correctly
