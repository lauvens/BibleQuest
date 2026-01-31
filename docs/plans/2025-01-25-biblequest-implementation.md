# BibleEidó Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a gamified Christian theology learning app in French with Duolingo-style progression.

**Architecture:** Next.js 14 App Router frontend with Supabase backend (auth, PostgreSQL, storage). Zustand for client state management. Tailwind for styling. Internationalized with next-intl for future English support.

**Tech Stack:** Next.js 14, Supabase, Tailwind CSS, Zustand, next-intl, Stripe, TypeScript

---

## Phase 1: Project Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Step 1: Create Next.js project with TypeScript and Tailwind**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with Next.js 14, TypeScript, Tailwind CSS

**Step 2: Verify project runs**

Run:
```bash
npm run dev
```

Expected: Server starts at http://localhost:3000

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

### Task 2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Supabase, Zustand, and utilities**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr zustand next-intl clsx tailwind-merge lucide-react
```

**Step 2: Install dev dependencies**

Run:
```bash
npm install -D @types/node supabase
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies (supabase, zustand, next-intl)"
```

---

### Task 3: Configure Tailwind with Custom Theme

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Update Tailwind config with BibleEidó theme colors**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        heart: '#ef4444',
        xp: '#22c55e',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Update globals.css with base styles**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "style: configure Tailwind with BibleEidó theme colors"
```

---

### Task 4: Create Utility Functions

**Files:**
- Create: `src/lib/utils.ts`

**Step 1: Create cn utility for class merging**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function calculateLevel(xp: number): number {
  // Level thresholds: 0, 100, 250, 500, 850, 1300, 1850, 2500, ...
  // Formula: threshold(n) = 50 * n * (n + 1)
  let level = 1;
  let threshold = 100;
  while (xp >= threshold) {
    level++;
    threshold = 50 * level * (level + 1);
  }
  return level;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export function xpForNextLevel(level: number): number {
  return 50 * level * (level + 1);
}

export function calculateHearts(hearts: number, heartsUpdatedAt: Date, maxHearts = 5): number {
  const now = new Date();
  const diffMs = now.getTime() - new Date(heartsUpdatedAt).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const regenerated = Math.floor(diffMinutes / 30);
  return Math.min(maxHearts, hearts + regenerated);
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 15) return 1.5;
  if (streak >= 8) return 1.25;
  return 1;
}
```

**Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add utility functions (cn, level calc, hearts, streak)"
```

---

### Task 5: Setup Supabase Client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `.env.local.example`

**Step 1: Create browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
}
```

**Step 3: Create middleware helper**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 4: Create env example file**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 5: Commit**

```bash
git add src/lib/supabase/ .env.local.example
git commit -m "feat: setup Supabase client (browser, server, middleware)"
```

---

### Task 6: Create Middleware

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create Next.js middleware**

```typescript
// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Next.js middleware for Supabase session"
```

---

### Task 7: Create TypeScript Types

**Files:**
- Create: `src/types/database.ts`
- Create: `src/types/index.ts`

**Step 1: Create database types**

```typescript
// src/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "ordering"
  | "typing"
  | "timed"
  | "image";

export type CosmeticType = "avatar" | "frame" | "title" | "theme";

export type UnlockType = "free" | "level" | "coins" | "gems";

export type UserRole = "user" | "admin";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          equipped_frame_id: string | null;
          equipped_title_id: string | null;
          theme: string;
          xp: number;
          level: number;
          coins: number;
          gems: number;
          hearts: number;
          hearts_updated_at: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          equipped_frame_id?: string | null;
          equipped_title_id?: string | null;
          theme?: string;
          xp?: number;
          level?: number;
          coins?: number;
          gems?: number;
          hearts?: number;
          hearts_updated_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          equipped_frame_id?: string | null;
          equipped_title_id?: string | null;
          theme?: string;
          xp?: number;
          level?: number;
          coins?: number;
          gems?: number;
          hearts?: number;
          hearts_updated_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          role?: UserRole;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name_key: string;
          icon: string;
          color: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          name_key: string;
          icon: string;
          color: string;
          order_index: number;
        };
        Update: {
          id?: string;
          name_key?: string;
          icon?: string;
          color?: string;
          order_index?: number;
        };
      };
      units: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          order_index: number;
          unlock_threshold: number;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          order_index: number;
          unlock_threshold?: number;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          unlock_threshold?: number;
          image_url?: string | null;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          name: string;
          order_index: number;
          xp_reward: number;
          coin_reward: number;
        };
        Insert: {
          id?: string;
          unit_id: string;
          name: string;
          order_index: number;
          xp_reward?: number;
          coin_reward?: number;
        };
        Update: {
          id?: string;
          unit_id?: string;
          name?: string;
          order_index?: number;
          xp_reward?: number;
          coin_reward?: number;
        };
      };
      questions: {
        Row: {
          id: string;
          lesson_id: string;
          type: QuestionType;
          content: Json;
          difficulty: number;
          is_ai_generated: boolean;
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: QuestionType;
          content: Json;
          difficulty?: number;
          is_ai_generated?: boolean;
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: QuestionType;
          content?: Json;
          difficulty?: number;
          is_ai_generated?: boolean;
          is_approved?: boolean;
        };
      };
      user_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed: boolean;
          best_score: number;
          attempts: number;
          last_attempt_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          last_attempt_at?: string;
        };
        Update: {
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          best_score?: number;
          attempts?: number;
          last_attempt_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          coin_reward: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          coin_reward?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          condition_type?: string;
          condition_value?: number;
          coin_reward?: number;
        };
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      cosmetics: {
        Row: {
          id: string;
          type: CosmeticType;
          name: string;
          asset_url: string | null;
          unlock_type: UnlockType;
          unlock_value: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          type: CosmeticType;
          name: string;
          asset_url?: string | null;
          unlock_type: UnlockType;
          unlock_value?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          type?: CosmeticType;
          name?: string;
          asset_url?: string | null;
          unlock_type?: UnlockType;
          unlock_value?: number;
          is_active?: boolean;
        };
      };
      user_cosmetics: {
        Row: {
          user_id: string;
          cosmetic_id: string;
          purchased_at: string;
          is_equipped: boolean;
        };
        Insert: {
          user_id: string;
          cosmetic_id: string;
          purchased_at?: string;
          is_equipped?: boolean;
        };
        Update: {
          user_id?: string;
          cosmetic_id?: string;
          purchased_at?: string;
          is_equipped?: boolean;
        };
      };
      bible_verses: {
        Row: {
          id: string;
          translation: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
        };
        Insert: {
          id?: string;
          translation: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
        };
        Update: {
          id?: string;
          translation?: string;
          book?: string;
          chapter?: number;
          verse?: number;
          text?: string;
        };
      };
    };
  };
}
```

**Step 2: Create index exports**

```typescript
// src/types/index.ts
export * from "./database";

// Question content types
export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correct: number;
}

export interface TrueFalseContent {
  statement: string;
  correct: boolean;
}

export interface FillBlankContent {
  verse: string;
  answer: string;
  reference: string;
}

export interface MatchingContent {
  pairs: { left: string; right: string }[];
}

export interface OrderingContent {
  prompt: string;
  items: string[];
  correct_order: number[];
}

export interface TypingContent {
  prompt: string;
  reference: string;
  text: string;
}

export interface TimedContent {
  time_limit: number;
  question: QuestionContent;
}

export interface ImageContent {
  image_url: string;
  question: string;
  options: string[];
  correct: number;
}

export type QuestionContent =
  | MultipleChoiceContent
  | TrueFalseContent
  | FillBlankContent
  | MatchingContent
  | OrderingContent
  | TypingContent
  | TimedContent
  | ImageContent;

// User state for Zustand
export interface UserState {
  id: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  hearts: number;
  heartsUpdatedAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  role: "user" | "admin";
  isGuest: boolean;
}

// Guest progress for localStorage
export interface GuestProgress {
  lessonProgress: Record<string, { completed: boolean; bestScore: number }>;
  xp: number;
  currentStreak: number;
  lastActivityDate: string | null;
}
```

**Step 3: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for database and app state"
```

---

### Task 8: Setup Supabase Project and Database Schema

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`

**Step 1: Create initial migration file**

```sql
-- supabase/migrations/00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering', 'typing', 'timed', 'image');
CREATE TYPE cosmetic_type AS ENUM ('avatar', 'frame', 'title', 'theme');
CREATE TYPE unlock_type AS ENUM ('free', 'level', 'coins', 'gems');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  equipped_frame_id UUID,
  equipped_title_id UUID,
  theme TEXT DEFAULT 'default',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  hearts_updated_at TIMESTAMPTZ DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_key TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Units
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  unlock_threshold INTEGER DEFAULT 0,
  image_url TEXT
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  coin_reward INTEGER DEFAULT 5
);

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  content JSONB NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
  is_ai_generated BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false
);

-- User Progress
CREATE TABLE public.user_progress (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  coin_reward INTEGER DEFAULT 0
);

-- User Achievements
CREATE TABLE public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Cosmetics
CREATE TABLE public.cosmetics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type cosmetic_type NOT NULL,
  name TEXT NOT NULL,
  asset_url TEXT,
  unlock_type unlock_type NOT NULL,
  unlock_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- User Cosmetics
CREATE TABLE public.user_cosmetics (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cosmetic_id UUID NOT NULL REFERENCES public.cosmetics(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, cosmetic_id)
);

-- Bible Verses
CREATE TABLE public.bible_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (translation, book, chapter, verse)
);

-- Weekly Leaderboard View
CREATE TABLE public.leaderboard_weekly (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  xp_this_week INTEGER DEFAULT 0,
  rank INTEGER
);

-- Indexes for performance
CREATE INDEX idx_units_category ON public.units(category_id);
CREATE INDEX idx_lessons_unit ON public.lessons(unit_id);
CREATE INDEX idx_questions_lesson ON public.questions(lesson_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX idx_bible_verses_book ON public.bible_verses(translation, book, chapter);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_weekly ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read own data, admins can read all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Categories, Units, Lessons, Questions: public read
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view units" ON public.units
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view approved questions" ON public.questions
  FOR SELECT USING (is_approved = true);

-- User Progress: users can manage their own
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements: public read
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User Achievements: users can manage their own
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cosmetics: public read active items
CREATE POLICY "Anyone can view active cosmetics" ON public.cosmetics
  FOR SELECT USING (is_active = true);

-- User Cosmetics: users can manage their own
CREATE POLICY "Users can view own cosmetics" ON public.user_cosmetics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cosmetics" ON public.user_cosmetics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cosmetics" ON public.user_cosmetics
  FOR UPDATE USING (auth.uid() = user_id);

-- Bible Verses: public read
CREATE POLICY "Anyone can view bible verses" ON public.bible_verses
  FOR SELECT USING (true);

-- Leaderboard: public read
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_weekly
  FOR SELECT USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Apply migration to Supabase**

Note: You need to have Supabase CLI linked to your project first.

Run:
```bash
npx supabase db push
```

Or apply via Supabase Dashboard SQL Editor.

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema migration"
```

---

### Task 9: Seed Initial Data

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Create seed data for categories and sample achievements**

```sql
-- supabase/seed.sql

-- Insert categories
INSERT INTO public.categories (name_key, icon, color, order_index) VALUES
  ('history', 'scroll', '#f59e0b', 1),
  ('context', 'map', '#10b981', 2),
  ('verses', 'book-open', '#3b82f6', 3),
  ('doctrines', 'church', '#8b5cf6', 4);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, coin_reward) VALUES
  ('Premier Pas', 'Complétez votre première leçon', 'footprints', 'lessons_completed', 1, 10),
  ('Semaine Fidèle', 'Maintenez une série de 7 jours', 'flame', 'streak', 7, 50),
  ('Historien', 'Complétez toutes les leçons d''Histoire', 'scroll', 'category_history', 100, 100),
  ('Mémoire Vive', 'Mémorisez 10 versets', 'brain', 'verses_memorized', 10, 75),
  ('Sans Faute', 'Complétez une leçon avec 100%', 'star', 'perfect_lesson', 1, 25),
  ('Érudit', 'Atteignez le niveau 10', 'graduation-cap', 'level', 10, 100),
  ('Dévoué', 'Maintenez une série de 30 jours', 'trophy', 'streak', 30, 200);

-- Insert starter cosmetics
INSERT INTO public.cosmetics (type, name, asset_url, unlock_type, unlock_value, is_active) VALUES
  -- Free avatars
  ('avatar', 'Disciple', '/avatars/disciple.png', 'free', 0, true),
  ('avatar', 'Berger', '/avatars/berger.png', 'free', 0, true),
  ('avatar', 'Prophète', '/avatars/prophete.png', 'free', 0, true),
  -- Level unlocks
  ('title', 'Apprenti', NULL, 'level', 5, true),
  ('theme', 'Violet', NULL, 'level', 10, true),
  ('frame', 'Couronne', '/frames/crown.png', 'level', 20, true),
  -- Coin purchases
  ('title', 'Disciple', NULL, 'coins', 100, true),
  ('theme', 'Bleu', NULL, 'coins', 150, true),
  ('avatar', 'Roi', '/avatars/roi.png', 'coins', 300, true),
  -- Gem purchases
  ('frame', 'Érudit', '/frames/erudit.png', 'gems', 50, true),
  ('theme', 'Or', NULL, 'gems', 100, true),
  ('avatar', 'Ange', '/avatars/ange.png', 'gems', 150, true);
```

**Step 2: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add seed data for categories, achievements, cosmetics"
```

---

## Phase 2: Authentication & User State

### Task 10: Create Zustand User Store

**Files:**
- Create: `src/lib/store/user-store.ts`

**Step 1: Create user store with Zustand**

```typescript
// src/lib/store/user-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserState, GuestProgress } from "@/types";
import { calculateHearts, calculateLevel } from "@/lib/utils";

interface UserStore extends UserState {
  // Actions
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  loseHeart: () => boolean;
  buyHeart: () => boolean;
  getActualHearts: () => number;
  updateStreak: () => void;

  // Guest progress
  guestProgress: GuestProgress;
  updateGuestProgress: (lessonId: string, score: number, completed: boolean) => void;
  clearGuestProgress: () => void;
}

const initialUserState: UserState = {
  id: null,
  email: null,
  username: null,
  avatarUrl: null,
  xp: 0,
  level: 1,
  coins: 0,
  gems: 0,
  hearts: 5,
  heartsUpdatedAt: new Date(),
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  role: "user",
  isGuest: true,
};

const initialGuestProgress: GuestProgress = {
  lessonProgress: {},
  xp: 0,
  currentStreak: 0,
  lastActivityDate: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialUserState,
      guestProgress: initialGuestProgress,

      setUser: (user) => set((state) => ({ ...state, ...user, isGuest: false })),

      clearUser: () => set({ ...initialUserState }),

      addXp: (amount) =>
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = calculateLevel(newXp);
          return { xp: newXp, level: newLevel };
        }),

      addCoins: (amount) =>
        set((state) => ({ coins: state.coins + amount })),

      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },

      addGems: (amount) =>
        set((state) => ({ gems: state.gems + amount })),

      spendGems: (amount) => {
        const state = get();
        if (state.gems >= amount) {
          set({ gems: state.gems - amount });
          return true;
        }
        return false;
      },

      loseHeart: () => {
        const state = get();
        const actualHearts = calculateHearts(
          state.hearts,
          state.heartsUpdatedAt
        );
        if (actualHearts > 0) {
          set({
            hearts: actualHearts - 1,
            heartsUpdatedAt: new Date(),
          });
          return true;
        }
        return false;
      },

      buyHeart: () => {
        const state = get();
        const actualHearts = calculateHearts(
          state.hearts,
          state.heartsUpdatedAt
        );
        if (state.coins >= 20 && actualHearts < 5) {
          set({
            coins: state.coins - 20,
            hearts: actualHearts + 1,
            heartsUpdatedAt: new Date(),
          });
          return true;
        }
        return false;
      },

      getActualHearts: () => {
        const state = get();
        return calculateHearts(state.hearts, state.heartsUpdatedAt);
      },

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const lastDate = state.lastActivityDate;

          if (lastDate === today) {
            return state; // Already active today
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          let newStreak = 1;
          if (lastDate === yesterdayStr) {
            newStreak = state.currentStreak + 1;
          }

          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActivityDate: today,
          };
        }),

      updateGuestProgress: (lessonId, score, completed) =>
        set((state) => ({
          guestProgress: {
            ...state.guestProgress,
            lessonProgress: {
              ...state.guestProgress.lessonProgress,
              [lessonId]: {
                completed,
                bestScore: Math.max(
                  state.guestProgress.lessonProgress[lessonId]?.bestScore || 0,
                  score
                ),
              },
            },
          },
        })),

      clearGuestProgress: () =>
        set({ guestProgress: initialGuestProgress }),
    }),
    {
      name: "bibleeido-user",
      partialize: (state) => ({
        guestProgress: state.guestProgress,
      }),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/lib/store/user-store.ts
git commit -m "feat: add Zustand user store with guest progress"
```

---

### Task 11: Create Auth Pages Layout

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/connexion/page.tsx`
- Create: `src/app/(auth)/inscription/page.tsx`

**Step 1: Create auth layout**

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create login page**

```typescript
// src/app/(auth)/connexion/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Connexion
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Continuez votre parcours biblique
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuer avec Google
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Pas encore de compte?{" "}
        <Link href="/inscription" className="text-primary-600 hover:underline font-medium">
          S&apos;inscrire
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500 mt-2">
        <Link href="/" className="hover:underline">
          Continuer en tant qu&apos;invité
        </Link>
      </p>
    </div>
  );
}
```

**Step 3: Create signup page**

```typescript
// src/app/(auth)/inscription/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Créer un compte
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Commencez votre aventure biblique
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            minLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        S&apos;inscrire avec Google
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Déjà un compte?{" "}
        <Link href="/connexion" className="text-primary-600 hover:underline font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add login and signup pages"
```

---

### Task 12: Create Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Step 1: Create OAuth callback handler**

```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

**Step 2: Commit**

```bash
git add src/app/auth/
git commit -m "feat: add OAuth callback route"
```

---

## Phase 3: Core UI Components

### Task 13: Create Base UI Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/progress-bar.tsx`

**Step 1: Create Button component**

```typescript
// src/components/ui/button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500":
              variant === "primary",
            "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500":
              variant === "secondary",
            "border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500":
              variant === "outline",
            "bg-transparent hover:bg-gray-100 focus:ring-gray-500":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
```

**Step 2: Create Card component**

```typescript
// src/components/ui/card.tsx
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-white",
          {
            "shadow-sm": variant === "default",
            "shadow-lg": variant === "elevated",
            "border border-gray-200": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pb-2", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-2", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardContent };
```

**Step 3: Create ProgressBar component**

```typescript
// src/components/ui/progress-bar.tsx
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: "primary" | "xp" | "gold";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max,
  className,
  color = "primary",
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", {
            "bg-primary-500": color === "primary",
            "bg-xp": color === "xp",
            "bg-gold-500": color === "gold",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-600 mt-1 text-right">
          {value} / {max}
        </p>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base UI components (Button, Card, ProgressBar)"
```

---

### Task 14: Create Game UI Components

**Files:**
- Create: `src/components/game/hearts-display.tsx`
- Create: `src/components/game/xp-bar.tsx`
- Create: `src/components/game/streak-badge.tsx`
- Create: `src/components/game/currency-display.tsx`

**Step 1: Create HeartsDisplay component**

```typescript
// src/components/game/hearts-display.tsx
"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
}

export function HeartsDisplay({
  hearts,
  maxHearts = 5,
  className,
}: HeartsDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxHearts }).map((_, i) => (
        <Heart
          key={i}
          className={cn("w-6 h-6 transition-colors", {
            "fill-heart text-heart": i < hearts,
            "fill-gray-200 text-gray-200": i >= hearts,
          })}
        />
      ))}
    </div>
  );
}
```

**Step 2: Create XpBar component**

```typescript
// src/components/game/xp-bar.tsx
"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { xpForLevel, xpForNextLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface XpBarProps {
  xp: number;
  level: number;
  className?: string;
}

export function XpBar({ xp, level, className }: XpBarProps) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-xp text-white font-bold text-sm">
        {level}
      </div>
      <div className="flex-1">
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpNeededForLevel}
          color="xp"
        />
        <p className="text-xs text-gray-600 mt-1">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Create StreakBadge component**

```typescript
// src/components/game/streak-badge.tsx
"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium",
        {
          "bg-orange-100 text-orange-600": isActive,
          "bg-gray-100 text-gray-400": !isActive,
        },
        className
      )}
    >
      <Flame
        className={cn("w-5 h-5", {
          "fill-orange-500": isActive,
        })}
      />
      <span>{streak}</span>
    </div>
  );
}
```

**Step 4: Create CurrencyDisplay component**

```typescript
// src/components/game/currency-display.tsx
"use client";

import { Coins, Gem } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  className?: string;
}

export function CurrencyDisplay({ coins, gems, className }: CurrencyDisplayProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-1.5">
        <Coins className="w-5 h-5 text-gold-500" />
        <span className="font-medium text-gray-700">{formatNumber(coins)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Gem className="w-5 h-5 text-secondary-500" />
        <span className="font-medium text-gray-700">{formatNumber(gems)}</span>
      </div>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/game/
git commit -m "feat: add game UI components (hearts, xp, streak, currency)"
```

---

### Task 15: Create Navigation Components

**Files:**
- Create: `src/components/layout/navbar.tsx`
- Create: `src/components/layout/bottom-nav.tsx`

**Step 1: Create Navbar component**

```typescript
// src/components/layout/navbar.tsx
"use client";

import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isGuest, getActualHearts, currentStreak, coins, gems } = useUserStore();
  const hearts = getActualHearts();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-600">BibleEidó</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <HeartsDisplay hearts={hearts} />
          <StreakBadge streak={currentStreak} />
          <CurrencyDisplay coins={coins} gems={gems} />
        </div>

        <div className="flex items-center gap-3">
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
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">U</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Create BottomNav component for mobile**

```typescript
// src/components/layout/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Target, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/apprendre", icon: BookOpen, label: "Apprendre" },
  { href: "/defi", icon: Target, label: "Défi" },
  { href: "/classement", icon: Trophy, label: "Classement" },
  { href: "/profil", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                {
                  "text-primary-600": isActive,
                  "text-gray-500 hover:text-gray-700": !isActive,
                }
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add navigation components (Navbar, BottomNav)"
```

---

### Task 16: Create Main Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(main)/layout.tsx`

**Step 1: Update root layout**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BibleEidó - Apprenez la Bible en vous amusant",
  description:
    "Application gamifiée pour apprendre l'histoire, le contexte et les versets de la Bible",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
```

**Step 2: Create main layout with navigation**

```typescript
// src/app/(main)/layout.tsx
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/\(main\)/layout.tsx
git commit -m "feat: setup main layout with navigation"
```

---

### Task 17: Create Home Page

**Files:**
- Create: `src/app/(main)/page.tsx`

**Step 1: Create home page with stats and quick actions**

```typescript
// src/app/(main)/page.tsx
"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/game/xp-bar";
import { HeartsDisplay } from "@/components/game/hearts-display";
import { StreakBadge } from "@/components/game/streak-badge";
import { CurrencyDisplay } from "@/components/game/currency-display";
import { useUserStore } from "@/lib/store/user-store";

export default function HomePage() {
  const {
    isGuest,
    username,
    xp,
    level,
    coins,
    gems,
    currentStreak,
    getActualHearts,
  } = useUserStore();

  const hearts = getActualHearts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isGuest
            ? "Bienvenue sur BibleEidó!"
            : `Bonjour, ${username || "Utilisateur"}!`}
        </h1>
        <p className="text-gray-600">
          {isGuest
            ? "Commencez votre voyage biblique dès maintenant"
            : "Continuez votre apprentissage"}
        </p>
      </div>

      {/* Stats Grid - Mobile */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Série</span>
            </div>
            <p className="text-2xl font-bold">{currentStreak} jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Coeurs</span>
            </div>
            <HeartsDisplay hearts={hearts} />
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Votre progression
          </h2>
          <XpBar xp={xp} level={level} />
          <div className="flex items-center justify-between mt-4">
            <CurrencyDisplay coins={coins} gems={gems} />
            <StreakBadge streak={currentStreak} />
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenge CTA */}
      <Card className="mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Défi Quotidien</h2>
              <p className="text-white/90">
                10 questions mixtes pour tester vos connaissances
              </p>
            </div>
            <Link href="/defi">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                <Target className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Que voulez-vous apprendre?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/apprendre?category=history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-900">Histoire</h3>
              <p className="text-xs text-gray-500 mt-1">
                Chronologie biblique
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=context">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Contexte</h3>
              <p className="text-xs text-gray-500 mt-1">Culture et géographie</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=verses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Versets</h3>
              <p className="text-xs text-gray-500 mt-1">Mémorisation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/apprendre?category=doctrines">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Doctrines</h3>
              <p className="text-xs text-gray-500 mt-1">Fondements de la foi</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Leaderboard Preview */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Classement</h2>
            <Link
              href="/classement"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-gold-500" />
            <p className="text-gray-600">
              Compétez avec d&apos;autres joueurs et grimpez dans le classement!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guest CTA */}
      {isGuest && (
        <Card className="mt-8 border-2 border-primary-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Créez un compte pour sauvegarder
            </h2>
            <p className="text-gray-600 mb-4">
              Votre progression sera perdue si vous ne créez pas de compte
            </p>
            <Link href="/inscription">
              <Button>Créer un compte gratuit</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(main\)/page.tsx
git commit -m "feat: create home page with stats and navigation"
```

---

## Phase 4: Learning System (Continued in Part 2)

The implementation plan continues with:

- Task 18-25: Question Components (all 8 types)
- Task 26-30: Learning Pages (categories, units, lessons)
- Task 31-35: Gamification Logic (scoring, achievements, leaderboard)
- Task 36-40: Shop & Stripe Integration
- Task 41-50: Admin Panel

---

## Summary

This plan covers the foundation for BibleEidó. Due to the project's scope, implementation is divided into phases:

**Phase 1 (Tasks 1-9):** Project setup, Supabase, database schema
**Phase 2 (Tasks 10-12):** Authentication & user state
**Phase 3 (Tasks 13-17):** Core UI components & layouts
**Phase 4 (Tasks 18-30):** Learning system & questions
**Phase 5 (Tasks 31-40):** Gamification & shop
**Phase 6 (Tasks 41-50):** Admin panel

Each task is bite-sized (2-5 minutes) with exact code and commands.

---

**Next Steps:**

After completing Phase 1-3, continue with Part 2 of this plan for the learning system implementation.
