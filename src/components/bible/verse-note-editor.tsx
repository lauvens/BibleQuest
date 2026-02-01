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
