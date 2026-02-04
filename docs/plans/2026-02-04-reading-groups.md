# Groupes de Lecture Biblique - Plan d'Implementation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre aux utilisateurs de créer des groupes de lecture avec un chef qui assigne des passages bibliques à lire avant une date limite, avec compte à rebours visible.

**Architecture:** Système de groupes avec rôles (owner/member), défis de lecture avec deadlines, et tracking de progression par membre. Utilise les patterns existants de mastery_paths pour la progression et Zustand pour le state client.

**Tech Stack:** Supabase (PostgreSQL + RLS), Next.js 14, TypeScript, Zustand, Tailwind CSS, Lucide Icons

---

## Vue d'ensemble

### Tables à créer
```
reading_groups (groupe principal)
    ↓ 1:n
group_members (membres avec rôles)
    ↓ n:1
reading_challenges (défis de lecture assignés par le chef)
    ↓ 1:n
challenge_progress (progression individuelle par membre)
```

### Flux utilisateur
1. Utilisateur crée un groupe → devient "owner"
2. Invite des amis via code/lien → deviennent "member"
3. Owner crée un défi: "Lire Jean 1-2 pour Jeudi 18h"
4. Membres voient le défi avec compte à rebours
5. Membres marquent comme "lu" → progression visible
6. Après deadline → discussion possible

---

## Task 1: Migration - Tables de base

**Files:**
- Create: `supabase/migrations/00007_reading_groups.sql`

**Step 1: Créer la migration**

```sql
-- supabase/migrations/00007_reading_groups.sql
-- Reading Groups: Groupes de lecture biblique avec défis

-- Role enum for group members
CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member');

-- Challenge status enum
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'cancelled');

-- Reading groups table
CREATE TABLE public.reading_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_color TEXT DEFAULT '#6366F1',
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  max_members INTEGER DEFAULT 20,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.reading_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Reading challenges (assigned by owner/admin)
CREATE TABLE public.reading_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.reading_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  -- Bible reference
  book_name TEXT NOT NULL,
  chapter_start INTEGER NOT NULL,
  verse_start INTEGER DEFAULT 1,
  chapter_end INTEGER,
  verse_end INTEGER,
  -- Deadline
  deadline TIMESTAMPTZ NOT NULL,
  status challenge_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual progress on challenges
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.reading_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_reading_challenges_group ON public.reading_challenges(group_id);
CREATE INDEX idx_reading_challenges_deadline ON public.reading_challenges(deadline);
CREATE INDEX idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);
CREATE INDEX idx_challenge_progress_user ON public.challenge_progress(user_id);

-- Enable RLS
ALTER TABLE public.reading_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Reading groups: members can view, creator can update/delete
CREATE POLICY "Members can view their groups" ON public.reading_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_groups.id
      AND group_members.user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Authenticated users can create groups" ON public.reading_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update group" ON public.reading_groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creator can delete group" ON public.reading_groups
  FOR DELETE USING (auth.uid() = creator_id);

-- Group members: members can view members, owner/admin can manage
CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner/admin can remove members" ON public.group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
    OR auth.uid() = user_id -- Can leave group
  );

-- Reading challenges: members can view, owner/admin can create
CREATE POLICY "Members can view challenges" ON public.reading_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_challenges.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner/admin can create challenges" ON public.reading_challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = reading_challenges.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creator can update challenge" ON public.reading_challenges
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete challenge" ON public.reading_challenges
  FOR DELETE USING (auth.uid() = created_by);

-- Challenge progress: users manage their own
CREATE POLICY "Members can view challenge progress" ON public.challenge_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reading_challenges rc
      JOIN public.group_members gm ON gm.group_id = rc.group_id
      WHERE rc.id = challenge_progress.challenge_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their progress" ON public.challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their progress" ON public.challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-add creator as owner
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON public.reading_groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_owner();
```

**Step 2: Appliquer la migration via Supabase MCP**

---

## Task 2: Types TypeScript

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Ajouter les types**

Ajouter après les types existants (ligne ~30):

```typescript
export type GroupRole = "owner" | "admin" | "member";

export type ChallengeStatus = "active" | "completed" | "cancelled";
```

Ajouter dans `Database["public"]["Tables"]`:

```typescript
      reading_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_color: string;
          creator_id: string;
          invite_code: string;
          max_members: number;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_color?: string;
          creator_id: string;
          invite_code?: string;
          max_members?: number;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_color?: string;
          creator_id?: string;
          invite_code?: string;
          max_members?: number;
          is_public?: boolean;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: GroupRole;
          joined_at?: string;
        };
      };
      reading_challenges: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          title: string;
          description: string | null;
          book_name: string;
          chapter_start: number;
          verse_start: number;
          chapter_end: number | null;
          verse_end: number | null;
          deadline: string;
          status: ChallengeStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          book_name: string;
          chapter_start: number;
          verse_start?: number;
          chapter_end?: number | null;
          verse_end?: number | null;
          deadline: string;
          status?: ChallengeStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          book_name?: string;
          chapter_start?: number;
          verse_start?: number;
          chapter_end?: number | null;
          verse_end?: number | null;
          deadline?: string;
          status?: ChallengeStatus;
          created_at?: string;
        };
      };
      challenge_progress: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          completed: boolean;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
```

---

## Task 3: Queries Supabase

**Files:**
- Modify: `src/lib/supabase/queries.ts`

**Step 1: Ajouter les queries pour les groupes**

```typescript
// ============================================
// READING GROUPS
// ============================================

type Tables = Database["public"]["Tables"];

// Get all groups for a user
export async function getUserGroups(userId: string) {
  const { data, error } = await supabase()
    .from("group_members")
    .select(`
      role,
      joined_at,
      reading_groups (
        id,
        name,
        description,
        cover_color,
        creator_id,
        invite_code,
        max_members,
        is_public,
        created_at
      )
    `)
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

// Get a single group with members and active challenges
export async function getGroupDetails(groupId: string) {
  const { data: group, error: groupError } = await supabase()
    .from("reading_groups")
    .select("*")
    .eq("id", groupId)
    .single();
  if (groupError) throw groupError;

  const { data: members, error: membersError } = await supabase()
    .from("group_members")
    .select(`
      id,
      role,
      joined_at,
      user_id,
      users (
        id,
        username,
        avatar_url,
        xp,
        level
      )
    `)
    .eq("group_id", groupId)
    .order("role", { ascending: true });
  if (membersError) throw membersError;

  const { data: challenges, error: challengesError } = await supabase()
    .from("reading_challenges")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .order("deadline", { ascending: true });
  if (challengesError) throw challengesError;

  return { group, members, challenges };
}

// Get group by invite code
export async function getGroupByInviteCode(inviteCode: string) {
  const { data, error } = await supabase()
    .from("reading_groups")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();
  if (error) throw error;
  return data;
}

// Create a new group
export async function createGroup(
  name: string,
  creatorId: string,
  description?: string,
  coverColor?: string
) {
  const { data, error } = await supabase()
    .from("reading_groups")
    .insert({
      name,
      creator_id: creatorId,
      description,
      cover_color: coverColor || "#6366F1",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Join a group
export async function joinGroup(groupId: string, userId: string) {
  const { data, error } = await supabase()
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Leave a group
export async function leaveGroup(groupId: string, userId: string) {
  const { error } = await supabase()
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

// Get members count for a group
export async function getGroupMembersCount(groupId: string) {
  const { count, error } = await supabase()
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  if (error) throw error;
  return count || 0;
}

// ============================================
// READING CHALLENGES
// ============================================

// Create a reading challenge
export async function createChallenge(
  groupId: string,
  createdBy: string,
  data: {
    title: string;
    description?: string;
    bookName: string;
    chapterStart: number;
    verseStart?: number;
    chapterEnd?: number;
    verseEnd?: number;
    deadline: string;
  }
) {
  const { data: challenge, error } = await supabase()
    .from("reading_challenges")
    .insert({
      group_id: groupId,
      created_by: createdBy,
      title: data.title,
      description: data.description,
      book_name: data.bookName,
      chapter_start: data.chapterStart,
      verse_start: data.verseStart || 1,
      chapter_end: data.chapterEnd,
      verse_end: data.verseEnd,
      deadline: data.deadline,
    })
    .select()
    .single();
  if (error) throw error;
  return challenge;
}

// Get challenge with progress for all members
export async function getChallengeWithProgress(challengeId: string) {
  const { data: challenge, error: challengeError } = await supabase()
    .from("reading_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (challengeError) throw challengeError;

  const { data: progress, error: progressError } = await supabase()
    .from("challenge_progress")
    .select(`
      id,
      user_id,
      completed,
      completed_at,
      notes,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq("challenge_id", challengeId);
  if (progressError) throw progressError;

  return { challenge, progress };
}

// Mark challenge as completed for user
export async function markChallengeCompleted(
  challengeId: string,
  userId: string,
  notes?: string
) {
  const { data, error } = await supabase()
    .from("challenge_progress")
    .upsert({
      challenge_id: challengeId,
      user_id: userId,
      completed: true,
      completed_at: new Date().toISOString(),
      notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get active challenges for a user (across all groups)
export async function getUserActiveChallenges(userId: string) {
  // Get user's groups first
  const { data: memberships, error: memberError } = await supabase()
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  if (memberError) throw memberError;

  const groupIds = memberships?.map((m) => m.group_id) || [];
  if (groupIds.length === 0) return [];

  // Get active challenges from those groups
  const { data: challenges, error: challengeError } = await supabase()
    .from("reading_challenges")
    .select(`
      *,
      reading_groups (
        id,
        name,
        cover_color
      )
    `)
    .in("group_id", groupIds)
    .eq("status", "active")
    .gte("deadline", new Date().toISOString())
    .order("deadline", { ascending: true });
  if (challengeError) throw challengeError;

  // Get user's progress on these challenges
  const challengeIds = challenges?.map((c) => c.id) || [];
  if (challengeIds.length === 0) return challenges;

  const { data: progress, error: progressError } = await supabase()
    .from("challenge_progress")
    .select("challenge_id, completed, completed_at")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds);
  if (progressError) throw progressError;

  const progressMap: Record<string, { completed: boolean; completed_at: string | null }> = {};
  progress?.forEach((p) => {
    progressMap[p.challenge_id] = { completed: p.completed, completed_at: p.completed_at };
  });

  return challenges?.map((c) => ({
    ...c,
    userProgress: progressMap[c.id] || { completed: false, completed_at: null },
  }));
}
```

---

## Task 4: Composants UI - GroupCard

**Files:**
- Create: `src/components/groups/group-card.tsx`

**Step 1: Créer le composant GroupCard**

```tsx
"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    is_public: boolean;
  };
  memberCount: number;
  activeChallenges: number;
  userRole: "owner" | "admin" | "member";
}

const roleLabels = {
  owner: "Chef",
  admin: "Admin",
  member: "Membre",
};

export function GroupCard({ group, memberCount, activeChallenges, userRole }: GroupCardProps) {
  return (
    <Link href={`/groupes/${group.id}`} className="group block">
      <div className="relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-parchment-200 dark:border-primary-700">
        {/* Color header */}
        <div
          className="h-24 relative"
          style={{ backgroundColor: group.cover_color }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Role badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-primary-800/90 rounded-full text-xs font-medium text-primary-700 dark:text-primary-200">
            {roleLabels[userRole]}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-1">
            {group.name}
          </h3>

          {group.description && (
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-primary-500 dark:text-primary-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {memberCount} membre{memberCount > 1 ? "s" : ""}
            </span>
            {activeChallenges > 0 && (
              <span className="flex items-center gap-1.5 text-accent-600 dark:text-accent-400">
                <Calendar className="w-4 h-4" />
                {activeChallenges} defi{activeChallenges > 1 ? "s" : ""} actif{activeChallenges > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## Task 5: Composants UI - ChallengeCard avec Countdown

**Files:**
- Create: `src/components/groups/challenge-card.tsx`

**Step 1: Créer le composant avec countdown**

```tsx
"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    book_name: string;
    chapter_start: number;
    verse_start: number;
    chapter_end: number | null;
    verse_end: number | null;
    deadline: string;
    reading_groups?: {
      id: string;
      name: string;
      cover_color: string;
    };
  };
  userProgress?: {
    completed: boolean;
    completed_at: string | null;
  };
  totalMembers?: number;
  completedCount?: number;
  onMarkComplete?: () => void;
  showGroupName?: boolean;
}

function formatTimeRemaining(deadline: string): { text: string; urgent: boolean; expired: boolean } {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "Termine", urgent: false, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days}j ${hours}h`, urgent: days <= 1, expired: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, urgent: hours <= 3, expired: false };
  }
  return { text: `${minutes}m`, urgent: true, expired: false };
}

function formatBibleReference(challenge: ChallengeCardProps["challenge"]): string {
  const { book_name, chapter_start, verse_start, chapter_end, verse_end } = challenge;

  if (chapter_end && chapter_end !== chapter_start) {
    return `${book_name} ${chapter_start}${verse_start > 1 ? `:${verse_start}` : ""} - ${chapter_end}${verse_end ? `:${verse_end}` : ""}`;
  }

  if (verse_end && verse_end !== verse_start) {
    return `${book_name} ${chapter_start}:${verse_start}-${verse_end}`;
  }

  if (verse_start > 1) {
    return `${book_name} ${chapter_start}:${verse_start}`;
  }

  return `${book_name} ${chapter_start}`;
}

export function ChallengeCard({
  challenge,
  userProgress,
  totalMembers,
  completedCount,
  onMarkComplete,
  showGroupName = false,
}: ChallengeCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(challenge.deadline));
  const isCompleted = userProgress?.completed || false;

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(challenge.deadline));
    }, 60000);
    return () => clearInterval(interval);
  }, [challenge.deadline]);

  const bibleRef = formatBibleReference(challenge);

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-primary-850 rounded-2xl overflow-hidden border transition-all",
        isCompleted
          ? "border-success-300 dark:border-success-700"
          : timeRemaining.urgent
          ? "border-error-300 dark:border-error-700"
          : "border-parchment-200 dark:border-primary-700"
      )}
    >
      {/* Group color bar */}
      {showGroupName && challenge.reading_groups && (
        <div
          className="h-2"
          style={{ backgroundColor: challenge.reading_groups.cover_color }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {showGroupName && challenge.reading_groups && (
              <p className="text-xs text-primary-500 dark:text-primary-400 mb-1">
                {challenge.reading_groups.name}
              </p>
            )}
            <h3 className="font-semibold text-primary-800 dark:text-parchment-50">
              {challenge.title}
            </h3>
          </div>

          {/* Status/Countdown badge */}
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Termine
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                timeRemaining.expired
                  ? "bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400"
                  : timeRemaining.urgent
                  ? "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400 animate-pulse"
                  : "bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              {timeRemaining.text}
            </div>
          )}
        </div>

        {/* Bible reference */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <BookOpen className="w-4 h-4 text-primary-400" />
          <span className="text-primary-700 dark:text-primary-300 font-medium">
            {bibleRef}
          </span>
        </div>

        {/* Description */}
        {challenge.description && (
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-2 line-clamp-2">
            {challenge.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-parchment-100 dark:border-primary-700">
          {/* Progress indicator */}
          {totalMembers !== undefined && completedCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-primary-500 dark:text-primary-400">
              <Users className="w-4 h-4" />
              <span>
                {completedCount}/{totalMembers} ont termine
              </span>
              <div className="w-16 h-1.5 bg-parchment-200 dark:bg-primary-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-500 transition-all"
                  style={{ width: `${(completedCount / totalMembers) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Mark complete button */}
          {!isCompleted && onMarkComplete && !timeRemaining.expired && (
            <button
              onClick={onMarkComplete}
              className="ml-auto px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Marquer comme lu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Task 6: Page - Liste des groupes

**Files:**
- Create: `src/app/(main)/groupes/page.tsx`

**Step 1: Créer la page liste des groupes**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search } from "lucide-react";
import Link from "next/link";
import { GroupCard } from "@/components/groups/group-card";
import { useUserStore } from "@/lib/store/user-store";
import { getUserGroups, getGroupMembersCount } from "@/lib/supabase/queries";

type GroupWithMeta = {
  group: {
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    is_public: boolean;
  };
  role: "owner" | "admin" | "member";
  memberCount: number;
  activeChallenges: number;
};

export default function GroupesPage() {
  const { id: userId, isGuest } = useUserStore();
  const [groups, setGroups] = useState<GroupWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isGuest || !userId) {
      setLoading(false);
      return;
    }

    async function loadGroups() {
      try {
        const data = await getUserGroups(userId!);
        const groupsWithMeta = await Promise.all(
          (data || []).map(async (item) => {
            const group = item.reading_groups as GroupWithMeta["group"];
            const memberCount = await getGroupMembersCount(group.id);
            return {
              group,
              role: item.role as "owner" | "admin" | "member",
              memberCount,
              activeChallenges: 0, // TODO: count active challenges
            };
          })
        );
        setGroups(groupsWithMeta);
      } catch (err) {
        console.error("Error loading groups:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, [userId, isGuest]);

  const filteredGroups = groups.filter(
    (g) =>
      g.group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isGuest) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Users className="w-20 h-20 text-primary-300 dark:text-primary-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-3">
            Groupes de lecture
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            Connectez-vous pour creer ou rejoindre des groupes de lecture biblique.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes groupes</h1>
                <p className="text-primary-200 mt-1">
                  Lisez la Bible ensemble avec vos amis
                </p>
              </div>
            </div>

            <Link
              href="/groupes/creer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Creer un groupe
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-primary-850 rounded-2xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-primary-200 dark:text-primary-700 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-primary-800 dark:text-parchment-50 mb-3">
              {searchQuery ? "Aucun groupe trouve" : "Aucun groupe"}
            </h2>
            <p className="text-primary-600 dark:text-primary-400 mb-6">
              {searchQuery
                ? "Essayez d'autres termes de recherche"
                : "Creez votre premier groupe ou rejoignez-en un avec un code d'invitation"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/groupes/creer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Creer un groupe
              </Link>
              <Link
                href="/groupes/rejoindre"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                Rejoindre
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(({ group, role, memberCount, activeChallenges }) => (
              <GroupCard
                key={group.id}
                group={group}
                memberCount={memberCount}
                activeChallenges={activeChallenges}
                userRole={role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 7: Page - Créer un groupe

**Files:**
- Create: `src/app/(main)/groupes/creer/page.tsx`

**Step 1: Créer la page de création**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Palette } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { createGroup } from "@/lib/supabase/queries";

const colorOptions = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#0EA5E9", // Sky
  "#6B7280", // Gray
];

export default function CreerGroupePage() {
  const router = useRouter();
  const { id: userId, isGuest } = useUserStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isGuest) {
    router.push("/connexion");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !userId) return;

    setLoading(true);
    setError("");

    try {
      const group = await createGroup(name.trim(), userId, description.trim() || undefined, color);
      router.push(`/groupes/${group.id}`);
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Erreur lors de la creation du groupe. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/groupes"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux groupes
        </Link>

        {/* Form card */}
        <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
          {/* Preview header */}
          <div
            className="h-24 flex items-end p-4 transition-colors"
            style={{ backgroundColor: color }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {name || "Nom du groupe"}
                </h2>
                <p className="text-white/70 text-sm">
                  {description || "Description du groupe"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Nom du groupe *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Etude du dimanche"
                maxLength={50}
                required
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez votre groupe..."
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-3">
                <Palette className="w-4 h-4 inline mr-2" />
                Couleur du groupe
              </label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-primary-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? "Creation..." : "Creer le groupe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 8: Page - Détail du groupe

**Files:**
- Create: `src/app/(main)/groupes/[groupId]/page.tsx`

**Step 1: Créer la page détail avec challenges et membres**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Settings,
  Copy,
  Check,
  Crown,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { ChallengeCard } from "@/components/groups/challenge-card";
import { useUserStore } from "@/lib/store/user-store";
import {
  getGroupDetails,
  markChallengeCompleted,
  getChallengeWithProgress,
} from "@/lib/supabase/queries";

type GroupDetails = Awaited<ReturnType<typeof getGroupDetails>>;

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { id: userId, isGuest } = useUserStore();

  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenges" | "members">("challenges");

  const userMember = data?.members?.find((m) => m.user_id === userId);
  const isOwnerOrAdmin = userMember?.role === "owner" || userMember?.role === "admin";

  useEffect(() => {
    if (isGuest) {
      router.push("/connexion");
      return;
    }

    async function load() {
      try {
        const details = await getGroupDetails(groupId);
        setData(details);
      } catch (err) {
        console.error("Error loading group:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [groupId, isGuest, router]);

  async function handleCopyInviteCode() {
    if (!data?.group.invite_code) return;
    await navigator.clipboard.writeText(data.group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMarkComplete(challengeId: string) {
    if (!userId) return;
    try {
      await markChallengeCompleted(challengeId, userId);
      // Reload data
      const details = await getGroupDetails(groupId);
      setData(details);
    } catch (err) {
      console.error("Error marking complete:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.group) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary-800 dark:text-parchment-50">
            Groupe non trouve
          </h1>
          <Link href="/groupes" className="text-primary-600 hover:underline mt-2 block">
            Retour aux groupes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      {/* Header */}
      <div
        className="text-white"
        style={{ backgroundColor: data.group.cover_color }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{data.group.name}</h1>
              {data.group.description && (
                <p className="text-white/80 mt-2">{data.group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Users className="w-4 h-4" />
                  {data.members?.length || 0} membres
                </span>
              </div>
            </div>

            {isOwnerOrAdmin && (
              <Link
                href={`/groupes/${groupId}/parametres`}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Invite code */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-white/70 text-sm">Code d'invitation:</span>
            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-mono transition-colors"
            >
              {data.group.invite_code}
              {copied ? (
                <Check className="w-4 h-4 text-success-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-primary-850 border-b border-parchment-200 dark:border-primary-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "challenges"
                  ? "border-primary-600 text-primary-800 dark:text-white"
                  : "border-transparent text-primary-500 hover:text-primary-700"
              }`}
            >
              Defis de lecture
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "members"
                  ? "border-primary-600 text-primary-800 dark:text-white"
                  : "border-transparent text-primary-500 hover:text-primary-700"
              }`}
            >
              Membres ({data.members?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "challenges" ? (
          <div className="space-y-6">
            {/* Add challenge button */}
            {isOwnerOrAdmin && (
              <Link
                href={`/groupes/${groupId}/nouveau-defi`}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-2xl text-primary-600 dark:text-primary-400 hover:border-primary-400 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Creer un nouveau defi de lecture
              </Link>
            )}

            {/* Challenges list */}
            {data.challenges && data.challenges.length > 0 ? (
              <div className="space-y-4">
                {data.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    totalMembers={data.members?.length || 0}
                    completedCount={0} // TODO: get from progress
                    onMarkComplete={() => handleMarkComplete(challenge.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-primary-500 dark:text-primary-400">
                  Aucun defi de lecture actif
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Members list */
          <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
            <div className="divide-y divide-parchment-100 dark:divide-primary-700">
              {data.members?.map((member) => {
                const user = member.users as {
                  id: string;
                  username: string | null;
                  avatar_url: string | null;
                  xp: number;
                  level: number;
                };
                const RoleIcon = roleIcons[member.role];

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 hover:bg-parchment-50 dark:hover:bg-primary-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-800 dark:text-parchment-50">
                          {user.username || "Utilisateur"}
                        </span>
                        <RoleIcon
                          className={`w-4 h-4 ${
                            member.role === "owner"
                              ? "text-yellow-500"
                              : member.role === "admin"
                              ? "text-blue-500"
                              : "text-primary-400"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-primary-500 dark:text-primary-400">
                        Niveau {user.level} • {user.xp} XP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 9: Page - Créer un défi

**Files:**
- Create: `src/app/(main)/groupes/[groupId]/nouveau-defi/page.tsx`

**Step 1: Créer la page de création de défi**

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { createChallenge } from "@/lib/supabase/queries";

// Liste simplifiée des livres de la Bible
const bibleBooks = [
  "Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome",
  "Josué", "Juges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques",
  "Esdras", "Néhémie", "Esther", "Job", "Psaumes",
  "Proverbes", "Ecclésiaste", "Cantique", "Ésaïe", "Jérémie",
  "Lamentations", "Ézéchiel", "Daniel", "Osée", "Joël",
  "Amos", "Abdias", "Jonas", "Michée", "Nahum",
  "Habacuc", "Sophonie", "Aggée", "Zacharie", "Malachie",
  "Matthieu", "Marc", "Luc", "Jean", "Actes",
  "Romains", "1 Corinthiens", "2 Corinthiens", "Galates",
  "Éphésiens", "Philippiens", "Colossiens", "1 Thessaloniciens",
  "2 Thessaloniciens", "1 Timothée", "2 Timothée", "Tite",
  "Philémon", "Hébreux", "Jacques", "1 Pierre", "2 Pierre",
  "1 Jean", "2 Jean", "3 Jean", "Jude", "Apocalypse",
];

export default function NouveauDefiPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { id: userId } = useUserStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookName, setBookName] = useState(bibleBooks[0]);
  const [chapterStart, setChapterStart] = useState(1);
  const [chapterEnd, setChapterEnd] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set default deadline to tomorrow
  useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeadline(tomorrow.toISOString().split("T")[0]);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !title.trim() || !deadline) return;

    setLoading(true);
    setError("");

    try {
      const deadlineISO = new Date(`${deadline}T${deadlineTime}`).toISOString();

      await createChallenge(groupId, userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        bookName,
        chapterStart,
        chapterEnd: chapterEnd ? Number(chapterEnd) : undefined,
        deadline: deadlineISO,
      });

      router.push(`/groupes/${groupId}`);
    } catch (err) {
      console.error("Error creating challenge:", err);
      setError("Erreur lors de la creation du defi. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  // Generate preview reference
  const previewRef = chapterEnd
    ? `${bookName} ${chapterStart}-${chapterEnd}`
    : `${bookName} ${chapterStart}`;

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/groupes/${groupId}`}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au groupe
        </Link>

        <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
          <div className="p-6 border-b border-parchment-200 dark:border-primary-700">
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
              Nouveau defi de lecture
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">
              Assignez un passage biblique a lire avant une date limite
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Titre du defi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Lecture de la semaine"
                maxLength={100}
                required
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Bible reference */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Passage biblique *
              </label>

              <div className="grid grid-cols-2 gap-4">
                {/* Book */}
                <div className="col-span-2">
                  <select
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {bibleBooks.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter start */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">
                    Chapitre debut
                  </label>
                  <input
                    type="number"
                    value={chapterStart}
                    onChange={(e) => setChapterStart(Number(e.target.value))}
                    min={1}
                    max={150}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Chapter end */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">
                    Chapitre fin (optionnel)
                  </label>
                  <input
                    type="number"
                    value={chapterEnd}
                    onChange={(e) =>
                      setChapterEnd(e.target.value ? Number(e.target.value) : "")
                    }
                    min={chapterStart}
                    max={150}
                    placeholder="-"
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                <BookOpen className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-primary-700 dark:text-primary-300">
                  Apercu: <strong>{previewRef}</strong>
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date limite *
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-primary-500 mb-1">Heure</label>
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Instructions (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez des instructions ou questions de reflexion..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!title.trim() || !deadline || loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? "Creation..." : "Creer le defi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 10: Page - Rejoindre un groupe

**Files:**
- Create: `src/app/(main)/groupes/rejoindre/page.tsx`

**Step 1: Créer la page pour rejoindre avec code**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { getGroupByInviteCode, joinGroup, getGroupMembersCount } from "@/lib/supabase/queries";

export default function RejoindreGroupePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const { id: userId, isGuest } = useUserStore();
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundGroup, setFoundGroup] = useState<{
    id: string;
    name: string;
    description: string | null;
    cover_color: string;
    max_members: number;
    memberCount: number;
  } | null>(null);

  if (isGuest) {
    router.push("/connexion");
    return null;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setFoundGroup(null);

    try {
      const group = await getGroupByInviteCode(code.trim().toLowerCase());
      const memberCount = await getGroupMembersCount(group.id);

      setFoundGroup({
        ...group,
        memberCount,
      });
    } catch (err) {
      setError("Code d'invitation invalide ou groupe non trouve.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!foundGroup || !userId) return;

    if (foundGroup.memberCount >= foundGroup.max_members) {
      setError("Ce groupe est complet.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await joinGroup(foundGroup.id, userId);
      router.push(`/groupes/${foundGroup.id}`);
    } catch (err: any) {
      if (err.code === "23505") {
        setError("Vous etes deja membre de ce groupe.");
      } else {
        setError("Erreur lors de l'adhesion. Veuillez reessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/groupes"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux groupes
        </Link>

        <div className="bg-white dark:bg-primary-850 rounded-2xl border border-parchment-200 dark:border-primary-700 overflow-hidden">
          <div className="p-6 border-b border-parchment-200 dark:border-primary-700 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
              Rejoindre un groupe
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">
              Entrez le code d'invitation du groupe
            </p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Code input */}
            <form onSubmit={handleSearch}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2C3D4"
                  maxLength={8}
                  className="flex-1 px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-primary-800 dark:text-parchment-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-center text-lg tracking-widest uppercase"
                />
                <button
                  type="submit"
                  disabled={!code.trim() || loading}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
                >
                  {loading && !foundGroup ? "..." : "Chercher"}
                </button>
              </div>
            </form>

            {/* Found group preview */}
            {foundGroup && (
              <div className="border border-parchment-200 dark:border-primary-700 rounded-xl overflow-hidden">
                <div
                  className="h-16"
                  style={{ backgroundColor: foundGroup.cover_color }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-primary-800 dark:text-parchment-50">
                    {foundGroup.name}
                  </h3>
                  {foundGroup.description && (
                    <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                      {foundGroup.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-sm text-primary-500">
                    <Users className="w-4 h-4" />
                    {foundGroup.memberCount}/{foundGroup.max_members} membres
                  </div>

                  <button
                    onClick={handleJoin}
                    disabled={loading || foundGroup.memberCount >= foundGroup.max_members}
                    className="w-full mt-4 py-3 bg-success-600 hover:bg-success-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-colors"
                  >
                    {loading ? "Adhesion..." : "Rejoindre ce groupe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 11: Navigation - Ajouter au menu

**Files:**
- Modify: `src/components/layout/navbar.tsx` (ou équivalent)
- Modify: `src/components/layout/bottom-nav.tsx` (ou équivalent)

**Step 1: Identifier et modifier les fichiers de navigation**

Ajouter un lien vers `/groupes` dans la navigation avec l'icône `Users`.

---

## Task 12: Tests manuels

**Step 1: Vérifier les fonctionnalités**

1. Créer un groupe → vérifier redirect et trigger auto-join
2. Copier le code d'invitation
3. Rejoindre avec un autre compte
4. Créer un défi de lecture
5. Vérifier le countdown
6. Marquer comme lu
7. Vérifier la progression des membres

---

## Résumé des fichiers

| Fichier | Action |
|---------|--------|
| `supabase/migrations/00007_reading_groups.sql` | Create |
| `src/types/database.ts` | Modify |
| `src/lib/supabase/queries.ts` | Modify |
| `src/components/groups/group-card.tsx` | Create |
| `src/components/groups/challenge-card.tsx` | Create |
| `src/app/(main)/groupes/page.tsx` | Create |
| `src/app/(main)/groupes/creer/page.tsx` | Create |
| `src/app/(main)/groupes/[groupId]/page.tsx` | Create |
| `src/app/(main)/groupes/[groupId]/nouveau-defi/page.tsx` | Create |
| `src/app/(main)/groupes/rejoindre/page.tsx` | Create |
| Navigation components | Modify |

---

## Estimation

- **Tables SQL + Types**: ~30 min
- **Queries**: ~30 min
- **Composants UI**: ~1h
- **Pages**: ~2h
- **Tests**: ~30 min

**Total estimé**: ~4-5h de développement
