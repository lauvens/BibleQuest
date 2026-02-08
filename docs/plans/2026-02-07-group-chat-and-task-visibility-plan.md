# Group Chat & Task Visibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add real-time group chat messaging and challenge progress visibility for group owners/admins.

**Architecture:** New `group_messages` table with Supabase Realtime subscriptions for live chat. Challenge progress visibility uses existing `challenge_progress` data exposed to owners/admins via a new accordion UI in ChallengeCard. Chat is a new tab in the group detail page.

**Tech Stack:** Next.js 14 (App Router), Supabase (Realtime + RLS), React, TypeScript, Tailwind CSS, Lucide icons.

---

### Task 1: Database Migration - group_messages table

**Files:**
- Create: `supabase/migrations/00008_group_messages.sql`

**Step 1: Write the migration**

```sql
-- supabase/migrations/00008_group_messages.sql
-- Group Messages: Real-time chat for reading groups

CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.reading_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  reply_to UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_group_messages_group_created ON public.group_messages(group_id, created_at DESC);
CREATE INDEX idx_group_messages_reply_to ON public.group_messages(reply_to);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view group messages" ON public.group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages" ON public.group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
```

**Step 2: Apply the migration to Supabase**

Use the Supabase MCP `apply_migration` tool with name `group_messages` and the SQL above.

**Step 3: Commit**

```bash
git add supabase/migrations/00008_group_messages.sql
git commit -m "feat: add group_messages table with RLS and realtime"
```

---

### Task 2: TypeScript Types - Add group_messages to database types

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add the type to database.ts**

After the `challenge_progress` table type, add:

```typescript
group_messages: {
  Row: {
    id: string;
    group_id: string;
    user_id: string;
    content: string;
    reply_to: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    group_id: string;
    user_id: string;
    content: string;
    reply_to?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    group_id?: string;
    user_id?: string;
    content?: string;
    reply_to?: string | null;
    created_at?: string;
  };
};
```

**Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add group_messages TypeScript types"
```

---

### Task 3: Supabase Queries - Chat message functions

**Files:**
- Modify: `src/lib/supabase/queries.ts`

**Step 1: Add chat query functions at the end of queries.ts**

```typescript
// ============================================
// GROUP MESSAGES (CHAT)
// ============================================

// Fetch messages for a group (paginated, newest last)
export async function getGroupMessages(
  groupId: string,
  limit: number = 50,
  beforeDate?: string
) {
  let query = supabase()
    .from("group_messages")
    .select(`
      id,
      group_id,
      user_id,
      content,
      reply_to,
      created_at,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (beforeDate) {
    query = query.lt("created_at", beforeDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Reverse so oldest is first (for display)
  return (data || []).reverse();
}

// Fetch a single message by ID (for reply previews)
export async function getMessageById(messageId: string) {
  const { data, error } = await supabase()
    .from("group_messages")
    .select(`
      id,
      content,
      user_id,
      users (
        username
      )
    `)
    .eq("id", messageId)
    .single();
  if (error) throw error;
  return data;
}

// Send a message
export async function sendGroupMessage(
  groupId: string,
  userId: string,
  content: string,
  replyTo?: string
) {
  const { data, error } = await supabase()
    .from("group_messages")
    .insert({
      group_id: groupId,
      user_id: userId,
      content: content.trim(),
      reply_to: replyTo || null,
    })
    .select(`
      id,
      group_id,
      user_id,
      content,
      reply_to,
      created_at,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .single();
  if (error) throw error;
  return data;
}

// Get challenge progress details for all members (for owner/admin view)
export async function getChallengeProgressDetails(
  challengeId: string,
  groupId: string
) {
  // Get all group members
  const { data: members, error: membersError } = await supabase()
    .from("group_members")
    .select(`
      user_id,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq("group_id", groupId);
  if (membersError) throw membersError;

  // Get progress for this challenge
  const { data: progress, error: progressError } = await supabase()
    .from("challenge_progress")
    .select("user_id, completed, completed_at")
    .eq("challenge_id", challengeId)
    .eq("completed", true);
  if (progressError) throw progressError;

  const progressMap = new Map(
    (progress || []).map((p) => [p.user_id, p])
  );

  // Combine: completed first (sorted by date), then pending (alphabetical)
  const result = (members || []).map((m) => {
    const user = m.users as unknown as { id: string; username: string | null; avatar_url: string | null };
    const prog = progressMap.get(m.user_id);
    return {
      user_id: m.user_id,
      username: user?.username || "Utilisateur",
      avatar_url: user?.avatar_url || null,
      completed: !!prog,
      completed_at: prog?.completed_at || null,
    };
  });

  // Sort: completed first by date, then pending alphabetically
  result.sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    if (a.completed && b.completed) {
      return new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime();
    }
    return (a.username).localeCompare(b.username);
  });

  return result;
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase/queries.ts
git commit -m "feat: add chat and challenge progress query functions"
```

---

### Task 4: GroupChat Component - Chat UI

**Files:**
- Create: `src/components/groups/group-chat.tsx`

**Step 1: Create the GroupChat component**

This component handles:
- Loading initial messages (50 most recent)
- Real-time subscription via Supabase Realtime
- Sending messages with optional reply-to
- Scroll-to-bottom on new messages
- Load more on scroll up
- Reply preview bar

The component receives `groupId`, `userId`, and `members` (for role badges) as props.

Key implementation details:
- Use `supabase().channel('group-chat-${groupId}')` for realtime
- Subscribe to `postgres_changes` with event `INSERT` on `group_messages` filtered by `group_id`
- On new message from realtime: if `user_id` matches a member, append to messages list
- Need to fetch the user info for realtime messages (join with users table in the select, or lookup from members list)
- Auto-scroll: track if user is near bottom (within 100px), only auto-scroll if so
- Reply-to state: `replyingTo: { id, username, content }` or null
- Message input: controlled textarea, send on Enter (not Shift+Enter), max 1000 chars

```
Props:
- groupId: string
- userId: string
- members: Array<{ user_id: string; role: string; users: { id: string; username: string; avatar_url: string | null } }>
```

Style notes (match existing design patterns from the codebase):
- Use `bg-white dark:bg-primary-800/50` for message container
- Use `border-parchment-200 dark:border-primary-700/50` for borders
- Own messages: `bg-primary-600 text-white` aligned right
- Others' messages: `bg-parchment-100 dark:bg-primary-700/50` aligned left
- Role badges: Crown icon amber for owner, Shield icon blue for admin (same as members list)
- Send button: `bg-primary-600 hover:bg-primary-700 text-white`
- Reply bar: `bg-parchment-100 dark:bg-primary-700/50` with left border accent color

**Step 2: Commit**

```bash
git add src/components/groups/group-chat.tsx
git commit -m "feat: add GroupChat component with realtime messaging"
```

---

### Task 5: ChallengeCard - Add progress visibility for owners/admins

**Files:**
- Modify: `src/components/groups/challenge-card.tsx`

**Step 1: Add new props and progress accordion**

Add to ChallengeCardProps:
```typescript
isOwnerOrAdmin?: boolean;
groupId?: string;
```

Add inside the component:
- State: `showProgress: boolean` (default false)
- State: `progressDetails: Array<{ user_id, username, avatar_url, completed, completed_at }> | null`
- State: `loadingProgress: boolean`
- When `showProgress` toggled on and `progressDetails` is null, call `getChallengeProgressDetails(challenge.id, groupId)`
- Render a "Voir la progression" button (only if `isOwnerOrAdmin`)
- Below button, render accordion panel with member list when `showProgress` is true

Button: uses `ChevronDown`/`ChevronUp` icon, styled like a subtle text button under the progress bar.

Accordion content: list of members with:
- Avatar (32x32, same style as members tab)
- Username
- Status icon: `CheckCircle` green if completed, `Clock` gray if pending
- Date formatted as "DD/MM à HH:mm" if completed

**Step 2: Commit**

```bash
git add src/components/groups/challenge-card.tsx
git commit -m "feat: add challenge progress visibility for owners/admins"
```

---

### Task 6: Group Detail Page - Add Chat tab

**Files:**
- Modify: `src/app/(main)/groupes/[groupId]/page.tsx`

**Step 1: Update the page to include Chat tab**

Changes needed:
1. Import `GroupChat` component and `MessageCircle` icon from lucide-react
2. Update `activeTab` state type from `"challenges" | "members"` to `"challenges" | "chat" | "members"`
3. Add a third tab button "Chat" between Defis and Membres
4. Add the chat tab content section that renders `<GroupChat>` when `activeTab === "chat"`
5. Pass `isOwnerOrAdmin` and `groupId` to each `<ChallengeCard>`

Tab order in UI: `Defis de lecture` | `Chat` | `Membres (N)`

The GroupChat component should receive:
- `groupId` from params
- `userId` from user store
- `members` from the loaded group data (for role display)

**Step 2: Commit**

```bash
git add src/app/(main)/groupes/[groupId]/page.tsx
git commit -m "feat: add Chat tab and pass admin props to ChallengeCard"
```

---

### Task 7: Cleanup and verify

**Step 1: Verify the build compiles**

```bash
npm run build
```

Fix any TypeScript errors.

**Step 2: Final commit**

```bash
git add -A
git commit -m "fix: resolve build errors for chat and task visibility"
```

---

## Implementation Order Summary

1. **Task 1** - DB migration (no code dependencies)
2. **Task 2** - TypeScript types (needed by queries)
3. **Task 3** - Query functions (needed by components)
4. **Task 4** - GroupChat component (depends on queries)
5. **Task 5** - ChallengeCard update (depends on queries)
6. **Task 6** - Group detail page update (depends on Tasks 4 & 5)
7. **Task 7** - Build verification
