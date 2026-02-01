# Verse Notes & Cross-References Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to add personal notes to verses they're reading and link cross-reference verses that display in an expandable popup without navigating away.

**Architecture:**
- New `verse_notes` table stores personal notes per user/verse (not tied to favorites)
- New `verse_references` table stores cross-reference links between verses
- Notes and references are accessible directly from the chapter reading view
- References display in a popover/modal showing the linked verse text

**Tech Stack:** Next.js, Supabase, TypeScript, Radix UI Popover

---

## Task 1: Database Schema - verse_notes table

**Files:**
- Create migration via Supabase MCP

**Step 1: Create verse_notes table**

Apply migration `create_verse_notes`:

```sql
-- Table for user personal notes on any verse (not just favorites)
CREATE TABLE verse_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Enable RLS
ALTER TABLE verse_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notes
CREATE POLICY "Users can view their own notes"
  ON verse_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert their own notes"
  ON verse_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
  ON verse_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON verse_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_verse_notes_user_verse ON verse_notes(user_id, verse_id);
```

**Step 2: Verify migration applied**

Check that table exists and RLS is enabled.

---

## Task 2: Database Schema - verse_references table

**Files:**
- Create migration via Supabase MCP

**Step 1: Create verse_references table**

Apply migration `create_verse_references`:

```sql
-- Table for user cross-references between verses
CREATE TABLE verse_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_verse_id UUID NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
  target_verse_id UUID NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source_verse_id, target_verse_id)
);

-- Enable RLS
ALTER TABLE verse_references ENABLE ROW LEVEL SECURITY;

-- Users can only see their own references
CREATE POLICY "Users can view their own references"
  ON verse_references FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own references
CREATE POLICY "Users can insert their own references"
  ON verse_references FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own references
CREATE POLICY "Users can delete their own references"
  ON verse_references FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for fast lookups
CREATE INDEX idx_verse_references_source ON verse_references(user_id, source_verse_id);
CREATE INDEX idx_verse_references_target ON verse_references(user_id, target_verse_id);
```

**Step 2: Verify migration applied**

Check that table exists and RLS is enabled.

---

## Task 3: Update TypeScript Types

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add verse_notes type**

Add after `bible_books` table definition (around line 407):

```typescript
      verse_notes: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      verse_references: {
        Row: {
          id: string;
          user_id: string;
          source_verse_id: string;
          target_verse_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_verse_id: string;
          target_verse_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_verse_id?: string;
          target_verse_id?: string;
          created_at?: string;
        };
      };
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

## Task 4: Add Query Functions

**Files:**
- Modify: `src/lib/supabase/queries.ts`

**Step 1: Add note CRUD functions**

Add at the end of the file:

```typescript
// ==========================================
// Verse Notes
// ==========================================

// Get note for a specific verse
export async function getVerseNote(userId: string, verseId: string) {
  const { data, error } = await supabase()
    .from("verse_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as Tables["verse_notes"]["Row"] | null;
}

// Get all notes for verses in a chapter (for bulk loading)
export async function getChapterNotes(userId: string, verseIds: string[]) {
  if (verseIds.length === 0) return new Map<string, string>();
  const { data, error } = await supabase()
    .from("verse_notes")
    .select("verse_id, content")
    .eq("user_id", userId)
    .in("verse_id", verseIds);
  if (error) throw error;
  const map = new Map<string, string>();
  (data ?? []).forEach((n) => map.set(n.verse_id, n.content));
  return map;
}

// Save or update a note
export async function saveVerseNote(
  userId: string,
  verseId: string,
  content: string
) {
  const { error } = await supabase()
    .from("verse_notes")
    .upsert(
      {
        user_id: userId,
        verse_id: verseId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,verse_id" }
    );
  if (error) throw error;
}

// Delete a note
export async function deleteVerseNote(userId: string, verseId: string) {
  const { error } = await supabase()
    .from("verse_notes")
    .delete()
    .eq("user_id", userId)
    .eq("verse_id", verseId);
  if (error) throw error;
}

// ==========================================
// Verse Cross-References
// ==========================================

// Get all references for a source verse
export async function getVerseReferences(userId: string, sourceVerseId: string) {
  const { data, error } = await supabase()
    .from("verse_references")
    .select("id, target_verse_id, bible_verses!verse_references_target_verse_id_fkey(*)")
    .eq("user_id", userId)
    .eq("source_verse_id", sourceVerseId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    targetVerse: r.bible_verses as unknown as Tables["bible_verses"]["Row"],
  }));
}

// Get reference counts for all verses in a chapter (for showing indicator)
export async function getChapterReferenceCounts(userId: string, verseIds: string[]) {
  if (verseIds.length === 0) return new Map<string, number>();
  const { data, error } = await supabase()
    .from("verse_references")
    .select("source_verse_id")
    .eq("user_id", userId)
    .in("source_verse_id", verseIds);
  if (error) throw error;
  const map = new Map<string, number>();
  (data ?? []).forEach((r) => {
    map.set(r.source_verse_id, (map.get(r.source_verse_id) ?? 0) + 1);
  });
  return map;
}

// Add a cross-reference
export async function addVerseReference(
  userId: string,
  sourceVerseId: string,
  targetVerseId: string
) {
  const { error } = await supabase()
    .from("verse_references")
    .insert({
      user_id: userId,
      source_verse_id: sourceVerseId,
      target_verse_id: targetVerseId,
    });
  if (error) throw error;
}

// Remove a cross-reference
export async function removeVerseReference(userId: string, referenceId: string) {
  const { error } = await supabase()
    .from("verse_references")
    .delete()
    .eq("user_id", userId)
    .eq("id", referenceId);
  if (error) throw error;
}

// Search verses for reference picker (by book/chapter/verse or text)
export async function searchVersesForReference(
  query: string,
  limit: number = 10
) {
  // Try to parse as reference (e.g., "Jean 3:16" or "Ephésiens 5:23")
  const refMatch = query.match(/^(.+?)\s*(\d+):(\d+)$/);
  if (refMatch) {
    const [, bookName, chapter, verse] = refMatch;
    const { data, error } = await supabase()
      .from("bible_verses")
      .select("*")
      .ilike("book", `%${bookName.trim()}%`)
      .eq("chapter", parseInt(chapter))
      .eq("verse", parseInt(verse))
      .limit(limit);
    if (error) throw error;
    return data as Tables["bible_verses"]["Row"][];
  }
  // Fall back to text search
  return searchVersesFTS(query, limit);
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

## Task 5: Create VerseNoteEditor Component

**Files:**
- Create: `src/components/bible/verse-note-editor.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { StickyNote, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VerseNoteEditorProps {
  verseId: string;
  initialContent: string | null;
  onSave: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function VerseNoteEditor({
  verseId,
  initialContent,
  onSave,
  onDelete,
  onClose,
}: VerseNoteEditorProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent, verseId]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(content.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-parchment-50 dark:bg-primary-800 border border-parchment-200 dark:border-primary-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-primary-700 dark:text-parchment-100">
          <StickyNote className="w-4 h-4" />
          <span className="font-medium text-sm">Note personnelle</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-parchment-200 dark:hover:bg-primary-700"
        >
          <X className="w-4 h-4 text-primary-500" />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez votre note..."
        className={cn(
          "w-full min-h-[100px] p-3 rounded-lg resize-none",
          "bg-white dark:bg-primary-900",
          "border border-parchment-200 dark:border-primary-700",
          "text-primary-700 dark:text-parchment-100",
          "placeholder:text-primary-400",
          "focus:outline-none focus:ring-2 focus:ring-gold-500"
        )}
        autoFocus
      />
      <div className="flex justify-between mt-3">
        {initialContent && (
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            disabled={deleting}
            className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? "..." : "Supprimer"}
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button onClick={onClose} variant="ghost" size="sm">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={saving || !content.trim()}
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 6: Create VerseReferencePopover Component

**Files:**
- Create: `src/components/bible/verse-reference-popover.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Link2, Plus, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];

interface Reference {
  id: string;
  targetVerse: BibleVerse;
}

interface VerseReferencePopoverProps {
  sourceVerseId: string;
  references: Reference[];
  onAddReference: (targetVerseId: string) => Promise<void>;
  onRemoveReference: (referenceId: string) => Promise<void>;
  onSearch: (query: string) => Promise<BibleVerse[]>;
  onClose: () => void;
}

export function VerseReferencePopover({
  sourceVerseId,
  references,
  onAddReference,
  onRemoveReference,
  onSearch,
  onClose,
}: VerseReferencePopoverProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(references.length === 0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await onSearch(searchQuery);
        // Filter out the source verse and already referenced verses
        const refIds = new Set(references.map((r) => r.targetVerse.id));
        setSearchResults(
          results.filter((v) => v.id !== sourceVerseId && !refIds.has(v.id))
        );
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, sourceVerseId, references, onSearch]);

  const handleAdd = async (verse: BibleVerse) => {
    setAdding(verse.id);
    try {
      await onAddReference(verse.id);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearch(false);
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (refId: string) => {
    setRemoving(refId);
    try {
      await onRemoveReference(refId);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-parchment-50 dark:bg-primary-800 border border-parchment-200 dark:border-primary-700 rounded-lg shadow-lg w-80 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-parchment-200 dark:border-primary-700">
        <div className="flex items-center gap-2 text-primary-700 dark:text-parchment-100">
          <Link2 className="w-4 h-4" />
          <span className="font-medium text-sm">Références croisées</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-parchment-200 dark:hover:bg-primary-700"
        >
          <X className="w-4 h-4 text-primary-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Existing References */}
        {references.length > 0 && (
          <div className="space-y-2">
            {references.map((ref) => (
              <div
                key={ref.id}
                className="bg-white dark:bg-primary-900 rounded-lg p-3 border border-parchment-200 dark:border-primary-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gold-600 dark:text-gold-500 mb-1">
                      {ref.targetVerse.book} {ref.targetVerse.chapter}:{ref.targetVerse.verse}
                    </p>
                    <p className="text-sm text-primary-700 dark:text-parchment-100 line-clamp-3">
                      {ref.targetVerse.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(ref.id)}
                    disabled={removing === ref.id}
                    className="p-1 rounded hover:bg-error-100 dark:hover:bg-error-900/20 text-error-500"
                  >
                    {removing === ref.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Reference */}
        {showSearch ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jean 3:16 ou chercher..."
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-lg",
                  "bg-white dark:bg-primary-900",
                  "border border-parchment-200 dark:border-primary-700",
                  "text-primary-700 dark:text-parchment-100 text-sm",
                  "placeholder:text-primary-400",
                  "focus:outline-none focus:ring-2 focus:ring-gold-500"
                )}
                autoFocus
              />
            </div>
            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
              </div>
            )}
            {!searching && searchResults.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((verse) => (
                  <button
                    key={verse.id}
                    onClick={() => handleAdd(verse)}
                    disabled={adding === verse.id}
                    className={cn(
                      "w-full text-left p-2 rounded-lg",
                      "hover:bg-parchment-100 dark:hover:bg-primary-700",
                      "transition-colors"
                    )}
                  >
                    <p className="text-xs font-semibold text-gold-600 dark:text-gold-500">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-300 line-clamp-2">
                      {verse.text}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-primary-500 text-center py-2">
                Aucun résultat
              </p>
            )}
          </div>
        ) : (
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une référence
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## Task 7: Update VerseList Component

**Files:**
- Modify: `src/components/bible/verse-list.tsx`

**Step 1: Add note and reference props and UI**

Replace the entire file with:

```tsx
"use client";

import { Heart, Copy, Check, StickyNote, Link2 } from "lucide-react";
import { useState } from "react";
import { Database } from "@/types/database";
import { VerseNoteEditor } from "./verse-note-editor";
import { VerseReferencePopover } from "./verse-reference-popover";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];

interface Reference {
  id: string;
  targetVerse: BibleVerse;
}

interface VerseListProps {
  verses: BibleVerse[];
  favoriteIds: Set<string>;
  notes: Map<string, string>;
  referenceCounts: Map<string, number>;
  isGuest: boolean;
  onToggleFavorite: (verseId: string) => void;
  onSaveNote: (verseId: string, content: string) => Promise<void>;
  onDeleteNote: (verseId: string) => Promise<void>;
  onLoadReferences: (verseId: string) => Promise<Reference[]>;
  onAddReference: (sourceVerseId: string, targetVerseId: string) => Promise<void>;
  onRemoveReference: (referenceId: string) => Promise<void>;
  onSearchVerses: (query: string) => Promise<BibleVerse[]>;
}

export function VerseList({
  verses,
  favoriteIds,
  notes,
  referenceCounts,
  isGuest,
  onToggleFavorite,
  onSaveNote,
  onDeleteNote,
  onLoadReferences,
  onAddReference,
  onRemoveReference,
  onSearchVerses,
}: VerseListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [viewingRefsId, setViewingRefsId] = useState<string | null>(null);
  const [loadedRefs, setLoadedRefs] = useState<Reference[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const handleCopy = async (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(verse.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenRefs = async (verseId: string) => {
    if (viewingRefsId === verseId) {
      setViewingRefsId(null);
      return;
    }
    setViewingRefsId(verseId);
    setLoadingRefs(true);
    try {
      const refs = await onLoadReferences(verseId);
      setLoadedRefs(refs);
    } finally {
      setLoadingRefs(false);
    }
  };

  const handleAddRef = async (targetVerseId: string) => {
    if (!viewingRefsId) return;
    await onAddReference(viewingRefsId, targetVerseId);
    // Reload refs
    const refs = await onLoadReferences(viewingRefsId);
    setLoadedRefs(refs);
  };

  const handleRemoveRef = async (refId: string) => {
    await onRemoveReference(refId);
    if (viewingRefsId) {
      const refs = await onLoadReferences(viewingRefsId);
      setLoadedRefs(refs);
    }
  };

  return (
    <div className="space-y-1">
      {verses.map((verse) => {
        const hasNote = notes.has(verse.id);
        const refCount = referenceCounts.get(verse.id) ?? 0;

        return (
          <div key={verse.id} className="relative">
            <div
              id={`verse-${verse.verse}`}
              className="group flex gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-parchment-100 dark:hover:bg-primary-800/50 transition-colors"
            >
              <span className="text-xs font-semibold text-gold-600 dark:text-gold-500 mt-1 min-w-[1.5rem]">
                {verse.verse}
              </span>
              <div className="flex-1">
                <p className="verse-text text-primary-700 dark:text-parchment-100">
                  {verse.text}
                </p>
                {/* Indicators */}
                {(hasNote || refCount > 0) && (
                  <div className="flex gap-2 mt-1">
                    {hasNote && (
                      <span className="inline-flex items-center gap-1 text-xs text-gold-600 dark:text-gold-500">
                        <StickyNote className="w-3 h-3" />
                        Note
                      </span>
                    )}
                    {refCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-info-600 dark:text-info-400">
                        <Link2 className="w-3 h-3" />
                        {refCount} réf.
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isGuest && (
                  <>
                    <button
                      onClick={() => onToggleFavorite(verse.id)}
                      className="p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
                      aria-label={favoriteIds.has(verse.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favoriteIds.has(verse.id)
                            ? "fill-error-500 text-error-500"
                            : "text-primary-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setEditingNoteId(editingNoteId === verse.id ? null : verse.id)}
                      className={`p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors ${
                        hasNote ? "text-gold-500" : "text-primary-400"
                      }`}
                      aria-label="Ajouter une note"
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenRefs(verse.id)}
                      className={`p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors ${
                        refCount > 0 ? "text-info-500" : "text-primary-400"
                      }`}
                      aria-label="Références croisées"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleCopy(verse)}
                  className="p-1.5 rounded hover:bg-parchment-200 dark:hover:bg-primary-700 transition-colors"
                  aria-label="Copier le verset"
                >
                  {copiedId === verse.id ? (
                    <Check className="w-4 h-4 text-success-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Note Editor */}
            {editingNoteId === verse.id && (
              <div className="mt-2 ml-8">
                <VerseNoteEditor
                  verseId={verse.id}
                  initialContent={notes.get(verse.id) ?? null}
                  onSave={(content) => onSaveNote(verse.id, content)}
                  onDelete={() => onDeleteNote(verse.id)}
                  onClose={() => setEditingNoteId(null)}
                />
              </div>
            )}

            {/* Reference Popover */}
            {viewingRefsId === verse.id && (
              <div className="absolute left-8 top-full z-50 mt-2">
                <VerseReferencePopover
                  sourceVerseId={verse.id}
                  references={loadingRefs ? [] : loadedRefs}
                  onAddReference={handleAddRef}
                  onRemoveReference={handleRemoveRef}
                  onSearch={onSearchVerses}
                  onClose={() => setViewingRefsId(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## Task 8: Update Chapter Page

**Files:**
- Modify: `src/app/(main)/bible/[book]/[chapter]/page.tsx`

**Step 1: Add state and handlers for notes and references**

Replace the entire file with:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerseList } from "@/components/bible/verse-list";
import { ChapterNav } from "@/components/bible/chapter-nav";
import { useUserStore } from "@/lib/store/user-store";
import {
  getChapter,
  getBibleBook,
  getUserFavoriteIds,
  toggleFavorite,
  getChapterNotes,
  saveVerseNote,
  deleteVerseNote,
  getChapterReferenceCounts,
  getVerseReferences,
  addVerseReference,
  removeVerseReference,
  searchVersesForReference,
} from "@/lib/supabase/queries";
import { Database } from "@/types/database";

type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];
type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];

export default function ChapterPage() {
  const params = useParams();
  const bookName = decodeURIComponent(params.book as string);
  const chapterNum = parseInt(params.chapter as string, 10);

  const { isGuest, id: userId } = useUserStore();

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [referenceCounts, setReferenceCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [versesData, bookData] = await Promise.all([
        getChapter(bookName, chapterNum),
        getBibleBook(bookName),
      ]);
      setVerses(versesData);
      setBook(bookData);

      // Load user data if logged in
      if (userId && !isGuest) {
        const verseIds = versesData.map((v) => v.id);
        const [favIds, notesData, refCounts] = await Promise.all([
          getUserFavoriteIds(userId),
          getChapterNotes(userId, verseIds),
          getChapterReferenceCounts(userId, verseIds),
        ]);
        setFavoriteIds(favIds);
        setNotes(notesData);
        setReferenceCounts(refCounts);
      } else {
        setFavoriteIds(new Set());
        setNotes(new Map());
        setReferenceCounts(new Map());
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bookName, chapterNum, userId, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleFavorite = useCallback(
    async (verseId: string) => {
      if (!userId || isGuest) return;
      try {
        const isFav = await toggleFavorite(userId, verseId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) {
            next.add(verseId);
          } else {
            next.delete(verseId);
          }
          return next;
        });
      } catch {
        // Silently fail
      }
    },
    [userId, isGuest]
  );

  const handleSaveNote = useCallback(
    async (verseId: string, content: string) => {
      if (!userId || isGuest) return;
      await saveVerseNote(userId, verseId, content);
      setNotes((prev) => new Map(prev).set(verseId, content));
    },
    [userId, isGuest]
  );

  const handleDeleteNote = useCallback(
    async (verseId: string) => {
      if (!userId || isGuest) return;
      await deleteVerseNote(userId, verseId);
      setNotes((prev) => {
        const next = new Map(prev);
        next.delete(verseId);
        return next;
      });
    },
    [userId, isGuest]
  );

  const handleLoadReferences = useCallback(
    async (verseId: string) => {
      if (!userId || isGuest) return [];
      return getVerseReferences(userId, verseId);
    },
    [userId, isGuest]
  );

  const handleAddReference = useCallback(
    async (sourceVerseId: string, targetVerseId: string) => {
      if (!userId || isGuest) return;
      await addVerseReference(userId, sourceVerseId, targetVerseId);
      // Update count
      setReferenceCounts((prev) => {
        const next = new Map(prev);
        next.set(sourceVerseId, (next.get(sourceVerseId) ?? 0) + 1);
        return next;
      });
    },
    [userId, isGuest]
  );

  const handleRemoveReference = useCallback(
    async (referenceId: string) => {
      if (!userId || isGuest) return;
      await removeVerseReference(userId, referenceId);
    },
    [userId, isGuest]
  );

  const handleSearchVerses = useCallback(async (query: string) => {
    return searchVersesForReference(query);
  }, []);

  const testamentColors =
    book?.testament === "old"
      ? "bg-olive-100 dark:bg-olive-900/40 text-olive-700 dark:text-olive-300"
      : "bg-info-100 dark:bg-info-900/40 text-info-700 dark:text-info-300";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/bible/${encodeURIComponent(bookName)}`}
        className="inline-flex items-center text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {bookName}
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-parchment-300 dark:bg-primary-700" />
            <div>
              <div className="h-7 w-48 bg-parchment-300 dark:bg-primary-700 rounded mb-2" />
              <div className="h-5 w-32 bg-parchment-300 dark:bg-primary-700 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-parchment-300 dark:bg-primary-700 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="p-6 text-center">
            <p className="text-error-600 dark:text-error-400 mb-4">
              Impossible de charger {bookName} {chapterNum}.
            </p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chapter Content */}
      {!loading && !error && book && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${testamentColors}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
                {bookName} {chapterNum}
              </h1>
              <p className="text-primary-500 dark:text-primary-400">
                {verses.length} verset{verses.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Chapter Navigation - Top */}
          <ChapterNav
            bookName={bookName}
            currentChapter={chapterNum}
            totalChapters={book.chapters}
          />

          {/* Verses */}
          <Card className="mt-6">
            <CardContent className="p-6">
              {verses.length > 0 ? (
                <VerseList
                  verses={verses}
                  favoriteIds={favoriteIds}
                  notes={notes}
                  referenceCounts={referenceCounts}
                  isGuest={isGuest}
                  onToggleFavorite={handleToggleFavorite}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onLoadReferences={handleLoadReferences}
                  onAddReference={handleAddReference}
                  onRemoveReference={handleRemoveReference}
                  onSearchVerses={handleSearchVerses}
                />
              ) : (
                <p className="text-center text-primary-500 dark:text-primary-400 py-8">
                  Aucun verset trouvé pour ce chapitre.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Chapter Navigation - Bottom */}
          <div className="mt-6">
            <ChapterNav
              bookName={bookName}
              currentChapter={chapterNum}
              totalChapters={book.chapters}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Task 9: Build and Verify

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Test locally**

Run: `npm run dev`
- Navigate to a chapter
- Hover over a verse to see note/reference buttons
- Add a note, verify it saves
- Add a cross-reference, verify it displays
- Remove reference, verify removal

---

## Task 10: Commit All Changes

**Step 1: Stage all files**

```bash
git add src/types/database.ts
git add src/lib/supabase/queries.ts
git add src/components/bible/verse-note-editor.tsx
git add src/components/bible/verse-reference-popover.tsx
git add src/components/bible/verse-list.tsx
git add "src/app/(main)/bible/[book]/[chapter]/page.tsx"
```

**Step 2: Create commit**

```bash
git commit -m "feat: add verse notes and cross-references

- Add verse_notes table for personal notes on any verse
- Add verse_references table for cross-reference links
- Create VerseNoteEditor component with save/delete
- Create VerseReferencePopover with search and display
- Update VerseList with note/reference indicators and buttons
- Update chapter page with all handlers
- Support verse reference search by 'Book Chapter:Verse' format"
```

---

## Verification Checklist

1. [ ] `verse_notes` table created with RLS policies
2. [ ] `verse_references` table created with RLS policies
3. [ ] TypeScript types updated for both tables
4. [ ] Query functions added for notes CRUD
5. [ ] Query functions added for references CRUD
6. [ ] VerseNoteEditor component created
7. [ ] VerseReferencePopover component created
8. [ ] VerseList updated with note/reference UI
9. [ ] Chapter page integrated with all handlers
10. [ ] `npm run build` passes
11. [ ] Notes can be added/edited/deleted
12. [ ] References can be added/removed
13. [ ] Reference search works (by reference and text)
14. [ ] Note/reference indicators show on verses

---

## File Summary

| Action | File |
|--------|------|
| Migration | `verse_notes` table via Supabase MCP |
| Migration | `verse_references` table via Supabase MCP |
| Modify | `src/types/database.ts` |
| Modify | `src/lib/supabase/queries.ts` |
| Create | `src/components/bible/verse-note-editor.tsx` |
| Create | `src/components/bible/verse-reference-popover.tsx` |
| Modify | `src/components/bible/verse-list.tsx` |
| Modify | `src/app/(main)/bible/[book]/[chapter]/page.tsx` |
