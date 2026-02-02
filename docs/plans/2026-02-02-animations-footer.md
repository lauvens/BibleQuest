# Animations Package + Footer Complet

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter des animations fun (compteurs animés, confetti, célébrations) et un footer complet avec navigation, liens légaux, réseaux sociaux et newsletter.

**Architecture:** Créer des composants réutilisables pour les animations et un footer sticky qui s'adapte au thème.

**Tech Stack:** Framer Motion (déjà installé), canvas-confetti, React

---

## Phase 1: Confetti & Célébrations

### Task 1: Install canvas-confetti

**Files:**
- Modify: `package.json`

**Step 1: Install canvas-confetti**

Run: `npm install canvas-confetti`
Run: `npm install -D @types/canvas-confetti`

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add canvas-confetti for celebrations"
```

---

### Task 2: Create confetti utility

**Files:**
- Create: `src/lib/confetti.ts`

```typescript
import confetti from "canvas-confetti";

// Basic confetti burst
export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Gold/biblical themed confetti
export function fireGoldConfetti() {
  const colors = ["#FF9F1C", "#FFD700", "#FFA500", "#38B6FF"];

  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors,
  });
}

// Side cannons for big achievements
export function fireCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ["#FF9F1C", "#38B6FF", "#FFD700"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Stars for streak celebrations
export function fireStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FFD700", "#FF9F1C", "#38B6FF"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["star"],
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    shapes: ["circle"],
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/confetti.ts
git commit -m "feat: add confetti utility functions"
```

---

## Phase 2: Animated Counter

### Task 3: Create AnimatedCounter component

**Files:**
- Create: `src/components/ui/animated-counter.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className,
  duration = 1,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <motion.span className={className}>
      {displayValue.toLocaleString()}
    </motion.span>
  );
}
```

**Step 2: Verify and commit**

```bash
npm run build
git add src/components/ui/animated-counter.tsx
git commit -m "feat: add AnimatedCounter component"
```

---

## Phase 3: Celebration Modal

### Task 4: Create CelebrationModal component

**Files:**
- Create: `src/components/ui/celebration-modal.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Flame, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fireCelebration, fireStars } from "@/lib/confetti";

type CelebrationType = "achievement" | "streak" | "level-up" | "course-complete";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  title: string;
  description?: string;
  reward?: {
    xp?: number;
    coins?: number;
    gems?: number;
  };
}

const iconMap = {
  achievement: Trophy,
  streak: Flame,
  "level-up": Star,
  "course-complete": Gift,
};

const colorMap = {
  achievement: "from-gold-400 to-gold-500",
  streak: "from-orange-400 to-red-500",
  "level-up": "from-accent-400 to-accent-500",
  "course-complete": "from-green-400 to-emerald-500",
};

export function CelebrationModal({
  isOpen,
  onClose,
  type,
  title,
  description,
  reward,
}: CelebrationModalProps) {
  const Icon = iconMap[type];
  const gradient = colorMap[type];

  useEffect(() => {
    if (isOpen) {
      if (type === "streak") {
        fireStars();
      } else {
        fireCelebration();
      }
    }
  }, [isOpen, type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-sm bg-parchment-50 dark:bg-primary-800 rounded-3xl p-8 text-center shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
            >
              <X className="w-5 h-5 text-primary-400" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-elevated`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2"
            >
              {title}
            </motion.h2>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-primary-500 dark:text-primary-400 mb-6"
              >
                {description}
              </motion.p>
            )}

            {/* Rewards */}
            {reward && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-4 mb-6"
              >
                {reward.xp && (
                  <div className="px-4 py-2 rounded-xl bg-accent-100 dark:bg-accent-900/30">
                    <span className="font-bold text-accent-600 dark:text-accent-400">+{reward.xp} XP</span>
                  </div>
                )}
                {reward.coins && (
                  <div className="px-4 py-2 rounded-xl bg-gold-100 dark:bg-gold-900/30">
                    <span className="font-bold text-gold-600 dark:text-gold-400">+{reward.coins}</span>
                  </div>
                )}
                {reward.gems && (
                  <div className="px-4 py-2 rounded-xl bg-info-100 dark:bg-info-900/30">
                    <span className="font-bold text-info-600 dark:text-info-400">+{reward.gems}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onClose} className="w-full">
                Continuer
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ui/celebration-modal.tsx
git commit -m "feat: add CelebrationModal with confetti effects"
```

---

## Phase 4: Streak Calendar

### Task 5: Create StreakCalendar component

**Files:**
- Create: `src/components/game/streak-calendar.tsx`

```tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDays: Date[];
  className?: string;
}

export function StreakCalendar({ activeDays, className }: StreakCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const result: Date[][] = [];

    // Get last 12 weeks (84 days)
    for (let w = 11; w >= 0; w--) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        week.push(date);
      }
      result.push(week);
    }
    return result;
  }, []);

  const isActive = (date: Date) => {
    return activeDays.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isFuture = (date: Date) => {
    return date > new Date();
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-gold-500" />
        <span className="font-semibold text-primary-800 dark:text-parchment-50">
          Activité récente
        </span>
      </div>

      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((date, dayIndex) => (
              <motion.div
                key={dayIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                className={cn(
                  "w-3 h-3 rounded-sm transition-colors",
                  isFuture(date)
                    ? "bg-parchment-200 dark:bg-primary-700"
                    : isActive(date)
                    ? "bg-gold-400 dark:bg-gold-500"
                    : "bg-parchment-300 dark:bg-primary-600",
                  isToday(date) && "ring-2 ring-accent-400 ring-offset-1"
                )}
                title={date.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-primary-400">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-parchment-300 dark:bg-primary-600" />
          <div className="w-3 h-3 rounded-sm bg-gold-200 dark:bg-gold-700" />
          <div className="w-3 h-3 rounded-sm bg-gold-400 dark:bg-gold-500" />
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/game/streak-calendar.tsx
git commit -m "feat: add StreakCalendar component like GitHub contributions"
```

---

## Phase 5: Footer Complet

### Task 6: Create Footer component

**Files:**
- Create: `src/components/layout/footer.tsx`

```tsx
"use client";

import Link from "next/link";
import { BookOpen, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const navigation = {
  main: [
    { name: "Bible", href: "/bible" },
    { name: "Parcours", href: "/parcours" },
    { name: "Défi", href: "/defi" },
    { name: "Classement", href: "/classement" },
  ],
  legal: [
    { name: "Confidentialité", href: "/confidentialite" },
    { name: "Conditions", href: "/conditions" },
    { name: "Contact", href: "/contact" },
  ],
  social: [
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com", icon: Youtube },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FadeIn>
      <footer className="bg-primary-900 dark:bg-primary-950 text-white mt-16">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-900" />
                </div>
                <span className="text-xl font-bold">BibleEidó</span>
              </Link>
              <p className="text-white/60 mb-4 max-w-sm">
                Apprenez la Bible de manière interactive et ludique.
                Mémorisez des versets, suivez des parcours et grandissez dans votre foi.
              </p>

              {/* Newsletter */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent-400"
                />
                <button className="px-4 py-2 rounded-xl bg-accent-400 text-primary-900 font-semibold hover:bg-accent-300 transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-white/40 text-sm">
              © {currentYear} BibleEidó. Tous droits réservés.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-white/60" />
                </a>
              ))}
            </div>

            {/* Version */}
            <p className="text-white/40 text-sm">
              v0.1.0
            </p>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat: add complete Footer with nav, newsletter, and socials"
```

---

### Task 7: Add Footer to main layout

**Files:**
- Modify: `src/app/(main)/layout.tsx`

Add the Footer component at the bottom of the layout, after the main content.

**Step 1: Read the current layout**
**Step 2: Import Footer and add it after {children}**
**Step 3: Commit**

```bash
git add src/app/(main)/layout.tsx
git commit -m "feat: add Footer to main layout"
```

---

## Phase 6: Integration

### Task 8: Update HeroSection with AnimatedCounter

**Files:**
- Modify: `src/components/home/hero-section.tsx`

Replace the static numbers for coins and gems with AnimatedCounter components.

**Step 1: Import AnimatedCounter**
**Step 2: Replace {coins} and {gems} with <AnimatedCounter value={coins} /> etc.**
**Step 3: Commit**

```bash
git add src/components/home/hero-section.tsx
git commit -m "feat: add animated counters to HeroSection"
```

---

### Task 9: Add StreakCalendar to homepage

**Files:**
- Modify: `src/app/(main)/page.tsx`

Add the StreakCalendar component between the Daily Verse and Explorer sections.

For now, generate placeholder active days (last 30 random days) until we have real data.

**Step 1: Import StreakCalendar**
**Step 2: Add it with placeholder data**
**Step 3: Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "feat: add StreakCalendar to homepage"
```

---

### Task 10: Final build and push

**Step 1: Run build**
```bash
npm run build
```

**Step 2: Push all changes**
```bash
git push
```

---

## Summary

| Fichier | Description |
|---------|-------------|
| `src/lib/confetti.ts` | Utilitaires confetti (burst, gold, celebration, stars) |
| `src/components/ui/animated-counter.tsx` | Compteur animé avec spring |
| `src/components/ui/celebration-modal.tsx` | Modal de célébration avec confetti |
| `src/components/game/streak-calendar.tsx` | Calendrier de streak style GitHub |
| `src/components/layout/footer.tsx` | Footer complet avec nav, newsletter, socials |
