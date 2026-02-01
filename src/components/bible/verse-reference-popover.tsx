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
