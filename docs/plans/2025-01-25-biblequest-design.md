# BibleEidó - Design Document

**Date:** 2025-01-25
**Status:** Approved

---

## Overview

BibleEidó is a gamified Christian theology learning app in French, inspired by Duolingo. Users learn Bible history, context, verses, and core doctrines through interactive lessons with a fun progression system.

**Target Platform:** Web first (Next.js), mobile later (React Native)
**Primary Language:** French (internationalized for English later)
**Bible Translation:** Louis Segond (public domain French)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Internationalization | next-intl |
| Payments | Stripe (gem purchases) |
| AI | OpenAI API (question generation) |

---

## Core Features

### Learning Structure

**4 Categories:**
1. Histoire (Bible History)
2. Contexte (Cultural/Geographic Context)
3. Versets (Verse Memorization)
4. Doctrines (Core Doctrines)

**Hierarchy:**
- Category → Units (5-7 per category) → Lessons (5-7 per unit) → Questions (10-15 per lesson)

**Lesson Modes:**
- Structured units: Progressive learning path
- Daily challenge: Mixed questions from all categories for retention

### Question Types

| Type | Description |
|------|-------------|
| Multiple Choice | 4 options, 1 correct |
| True/False | Statement validation |
| Fill in Blank | Complete the verse |
| Matching Pairs | Connect related items |
| Ordering | Arrange chronologically |
| Typing | Type verse from memory |
| Timed | Any type with countdown |
| Image-based | Maps, artwork questions |

### Question Content Structure (JSON)

```json
// Multiple Choice
{ "question": "Qui a construit l'arche?",
  "options": ["Noé", "Abraham", "Moïse", "David"],
  "correct": 0 }

// True/False
{ "statement": "David a tué Goliath avec une épée.",
  "correct": false }

// Fill in Blank
{ "verse": "Car Dieu a tant aimé le ___ qu'il a donné son Fils unique.",
  "answer": "monde",
  "reference": "Jean 3:16" }

// Matching Pairs
{ "pairs": [
    {"left": "Abraham", "right": "Père de la foi"},
    {"left": "Moïse", "right": "Les 10 commandements"},
    {"left": "David", "right": "Roi berger"}
  ]}

// Ordering
{ "prompt": "Mettez ces événements dans l'ordre chronologique",
  "items": ["Création", "Déluge", "Exode", "Temple de Salomon"],
  "correct_order": [0, 1, 2, 3] }

// Typing (Verse)
{ "prompt": "Tapez Jean 3:16",
  "reference": "Jean 3:16",
  "text": "Car Dieu a tant aimé le monde..." }

// Timed Challenge
{ "time_limit": 30,
  "question": { /* any question type above */ }}

// Image-Based
{ "image_url": "/maps/israel.png",
  "question": "Où se trouve Jérusalem?",
  "options": ["A", "B", "C", "D"],
  "correct": 1 }
```

---

## Gamification System

### Dual Currency

**Coins (earned in-game only):**
- Earned from: lessons, streaks, achievements, daily challenges
- Can buy: extra hearts, some cosmetics
- Cannot be purchased with real money

**Gems (premium currency):**
- Purchased with real money only (Stripe)
- Used for: premium cosmetics only
- Cannot buy hearts (no pay-to-win)

### XP & Leveling

```
Level 1: 0 XP
Level 2: 100 XP
Level 3: 250 XP
Level 4: 500 XP
... (progressive increase)
```

**Scoring:**
- Correct answer: +10 XP base
- Difficulty bonus: ×1 / ×1.5 / ×2 for difficulty 1/2/3
- Timed bonus: +5 XP if answered in under 5 seconds

### Hearts System

- Maximum: 5 hearts
- Lose 1 per wrong answer
- 0 hearts = cannot continue lessons
- Regenerate: 1 heart every 30 minutes
- Buy: 1 heart for 20 coins

### Streak System

- Complete at least 1 lesson per day to maintain streak
- Streak multiplier: Day 1-7 = ×1, Day 8-14 = ×1.25, Day 15+ = ×1.5
- Losing streak resets multiplier (not XP)

### Achievements

| Badge | Condition | Reward |
|-------|-----------|--------|
| Premier Pas | Complete first lesson | 10 coins |
| Semaine Fidèle | 7-day streak | 50 coins |
| Historien | Complete History category | 100 coins |
| Mémoire Vive | Memorize 10 verses | 75 coins |
| Sans Faute | Complete lesson with 100% | 25 coins |

### Cosmetics

| Type | Unlock Method |
|------|---------------|
| Starter avatars | Free at signup |
| Level rewards | Reach Level 5, 10, 15... |
| Coin cosmetics | Buy with earned coins |
| Premium cosmetics | Buy with gems only |

**Example Shop:**
```
Coins Shop:
- Extra heart: 20 coins
- "Disciple" title: 100 coins
- Blue theme: 150 coins

Gems Shop:
- "Érudit" frame: 50 gems
- Gold theme: 100 gems
- Animated avatar: 200 gems (Phase 2)

Level Unlocks (free):
- Level 5: "Apprenti" title
- Level 10: Purple theme
- Level 20: Crown avatar frame
```

---

## Database Schema

```sql
-- Users & Auth
users
├── id (uuid, PK)
├── email
├── username
├── avatar_url
├── equipped_frame_id
├── equipped_title_id
├── theme
├── xp (int)
├── level (int)
├── coins (int)
├── gems (int)
├── hearts (int, max 5)
├── hearts_updated_at (timestamp)
├── current_streak (int)
├── longest_streak (int)
├── last_activity_date (date)
├── role (enum: user, admin)
└── created_at

-- Content Structure
categories
├── id (uuid, PK)
├── name_key (string)
├── icon
├── color
└── order_index

units
├── id (uuid, PK)
├── category_id (FK)
├── name
├── description
├── order_index
├── unlock_threshold (XP needed)
└── image_url

lessons
├── id (uuid, PK)
├── unit_id (FK)
├── name
├── order_index
├── xp_reward
└── coin_reward

questions
├── id (uuid, PK)
├── lesson_id (FK)
├── type (enum)
├── content (jsonb)
├── difficulty (1-3)
├── is_ai_generated (bool)
└── is_approved (bool)

-- Progress Tracking
user_progress
├── user_id (FK)
├── lesson_id (FK)
├── completed (bool)
├── best_score (int)
├── attempts (int)
└── last_attempt_at

-- Achievements
achievements
├── id (uuid, PK)
├── name
├── description
├── icon
├── condition_type
├── condition_value
└── coin_reward

user_achievements
├── user_id (FK)
├── achievement_id (FK)
└── unlocked_at

-- Cosmetics
cosmetics
├── id (uuid, PK)
├── type (enum: avatar, frame, title, theme)
├── name
├── asset_url
├── unlock_type (enum: free, level, coins, gems)
├── unlock_value (int)
└── is_active (bool)

user_cosmetics
├── user_id (FK)
├── cosmetic_id (FK)
├── purchased_at
└── is_equipped

-- Leaderboard (materialized view or table)
leaderboard_weekly
├── user_id
├── username
├── avatar_url
├── xp_this_week
└── rank

-- Bible Content
bible_verses
├── id (uuid, PK)
├── translation (string)
├── book
├── chapter (int)
├── verse (int)
└── text
```

---

## User Flows

### Guest → User Journey

```
1. Landing page → "Commencer" button
2. Guest mode starts → Pick category
3. Complete first lesson (no account needed)
4. Prompt: "Créer un compte pour sauvegarder"
5. Sign up (email or Google/Apple)
6. Progress synced to account
```

### Lesson Flow

```
1. Select category → Select unit → Select lesson
2. Lesson starts (10-15 questions)
3. Answer question → Immediate feedback
4. Wrong = lose 1 heart
5. Complete lesson → XP + coins awarded
6. Achievement check → Unlock if earned
7. Return to unit (next lesson unlocked)
```

---

## Screen Structure

```
🏠 Accueil (/)
├── Daily challenge card
├── Current streak & hearts display
├── Continue learning (last lesson)
└── Quick stats (XP, level, coins, gems)

📚 Apprendre (/apprendre)
├── 4 category cards
├── /apprendre/[category] → Unit list
└── /apprendre/[category]/[unit]/[lesson] → Lesson

🎯 Défi Quotidien (/defi)
├── Mixed questions from all categories
├── 10 questions, timed
└── Results + leaderboard position

🏆 Classement (/classement)
├── Weekly / All-time toggle
├── Top 100 players
└── Your rank highlighted

👤 Profil (/profil)
├── Avatar, frame, title display
├── Stats
├── Achievements gallery
└── /profil/edit → Edit profile

🛒 Boutique (/boutique)
├── Coins tab
├── Gems tab
└── Level rewards preview

⚙️ Paramètres (/parametres)
├── Account management
├── Language
├── Notifications
└── Theme selection

🔐 Auth
├── /connexion (login)
├── /inscription (signup)
└── /mot-de-passe-oublie (forgot password)

👑 Admin (/admin) - Protected
├── /admin → Dashboard
├── /admin/bible → Bible import
├── /admin/contenu → Content management
├── /admin/questions → AI question generator
└── /admin/boutique → Cosmetics manager
```

---

## Admin Panel

### Features (MVP)

**Dashboard:**
- Quick stats (total users, active today, lessons completed)
- Recent activity feed

**Bible Import:**
- Import Louis Segond from API
- View imported verses

**Content Management:**
- CRUD for categories, units, lessons, questions
- Drag-and-drop reorder
- Preview lesson

**AI Question Generator:**
- Select lesson/topic
- Generate draft questions
- Review queue: Approve / Edit / Reject

**Cosmetics Manager:**
- Add/edit cosmetics
- Set unlock type and price
- Enable/disable items

### Admin Access

- Role stored in `users.role`
- Middleware checks role before `/admin` access
- Set first admin manually in Supabase

---

## MVP Scope

### Included

- 4 categories with 2-3 units each
- All 8 question types
- XP, levels, coins, gems
- Hearts system with regeneration + coin purchase
- Daily streaks
- Daily challenge mode
- Weekly & all-time leaderboards
- Shop (hearts, cosmetics)
- Gem purchase (Stripe)
- Guest mode + email/Google auth
- Admin: Bible import, content CRUD, AI questions, cosmetics

### Phase 2 (Later)

- Friends & social features
- Study groups / church competitions
- Animated celebrations
- English UI + KJV Bible
- User management in admin
- Advanced analytics
- Mobile app (React Native)
- Audio features
- Apple sign-in

---

## Technical Considerations

### Heart Regeneration

Calculate hearts on-demand:
```typescript
function calculateHearts(hearts: number, heartsUpdatedAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - heartsUpdatedAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const regenerated = Math.floor(diffMinutes / 30);
  return Math.min(5, hearts + regenerated);
}
```

### Leaderboard Performance

- Use materialized view or separate table
- Update weekly leaderboard via Supabase Edge Function (cron)
- Cache with appropriate TTL

### Guest Mode

- Store progress in localStorage
- On signup, migrate localStorage data to Supabase
- Clear localStorage after migration

### AI Question Generation

- Use OpenAI API via Supabase Edge Function
- Rate limit to prevent abuse
- All AI questions require admin approval

---

## File Structure

```
bible/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx (home)
│   │   │   ├── apprendre/
│   │   │   ├── defi/
│   │   │   ├── classement/
│   │   │   ├── profil/
│   │   │   ├── boutique/
│   │   │   └── parametres/
│   │   ├── (auth)/
│   │   │   ├── connexion/
│   │   │   ├── inscription/
│   │   │   └── mot-de-passe-oublie/
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── bible/
│   │   │   ├── contenu/
│   │   │   ├── questions/
│   │   │   └── boutique/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (buttons, cards, modals)
│   │   ├── questions/ (each question type)
│   │   ├── game/ (hearts, xp bar, streak)
│   │   └── layout/ (navbar, sidebar)
│   ├── lib/
│   │   ├── supabase/ (client, server, middleware)
│   │   ├── store/ (zustand stores)
│   │   └── utils/
│   ├── hooks/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── functions/
├── public/
│   ├── images/
│   └── icons/
├── messages/ (i18n)
│   └── fr.json
└── docs/
    └── plans/
```

---

## Success Metrics

- Daily Active Users (DAU)
- Lesson completion rate
- Average session duration
- 7-day retention rate
- Streak maintenance rate
- Conversion rate (guest → registered)
- Gem purchase revenue
