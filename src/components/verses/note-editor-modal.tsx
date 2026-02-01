"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteEditorModalProps {
  isOpen: boolean;
  verseReference: string;
  initialNote: string | null;
  onSave: (note: string | null) => void;
  onClose: () => void;
}

const MAX_CHARS = 2000;

export function NoteEditorModal({
  isOpen,
  verseReference,
  initialNote,
  onSave,
  onClose,
}: NoteEditorModalProps) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset note when modal opens with new initial value
  useEffect(() => {
    if (isOpen) {
      setNote(initialNote ?? "");
      // Focus textarea on open
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialNote]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmedNote = note.trim();
      await onSave(trimmedNote || null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onSave(null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const charCount = note.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-primary-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-200 dark:border-primary-700">
          <div>
            <h2 className="text-lg font-semibold text-primary-800 dark:text-parchment-50">
              Note personnelle
            </h2>
            <p className="text-sm text-primary-500 dark:text-primary-400">
              {verseReference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 hover:bg-parchment-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ecrivez votre reflexion sur ce verset..."
            className={cn(
              "w-full h-40 p-4 rounded-lg resize-none",
              "bg-parchment-50 dark:bg-primary-750",
              "border border-parchment-200 dark:border-primary-600",
              "text-primary-800 dark:text-parchment-100",
              "placeholder:text-primary-400 dark:placeholder:text-primary-500",
              "focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent",
              isOverLimit && "border-error-500 focus:ring-error-500"
            )}
          />

          {/* Character count */}
          <div className="flex justify-end mt-2">
            <span
              className={cn(
                "text-xs",
                isOverLimit
                  ? "text-error-500"
                  : charCount > MAX_CHARS * 0.9
                    ? "text-warning-500"
                    : "text-primary-400 dark:text-primary-500"
              )}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-parchment-200 dark:border-primary-700 bg-parchment-50 dark:bg-primary-750">
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={saving || !initialNote}
            className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || isOverLimit}
              className="bg-gold-600 hover:bg-gold-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
