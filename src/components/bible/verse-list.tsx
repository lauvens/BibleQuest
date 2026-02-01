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
              {/* Buttons: always visible on mobile, hover on desktop */}
              <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
