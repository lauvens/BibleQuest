"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isGuest) {
      router.push("/connexion");
    }
  }, [isGuest, router]);

  if (isGuest) {
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
    } catch (err: unknown) {
      console.error("Error creating group:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur: ${message}`);
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
        <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 overflow-hidden">
          {/* Preview header */}
          <div className="p-4 border-b border-parchment-200 dark:border-primary-700/50 bg-parchment-50/50 dark:bg-primary-800/30">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-700/50 flex items-center justify-center transition-colors">
                  <Users className="w-7 h-7 text-primary-600 dark:text-primary-300" />
                </div>
                {/* Color indicator dot */}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white dark:border-primary-800 transition-colors"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-800 dark:text-parchment-100">
                  {name || "Nom du groupe"}
                </h2>
                <p className="text-primary-500 dark:text-primary-400 text-sm">
                  {description || "Description du groupe"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800/50 text-error-600 dark:text-error-400 rounded-xl text-sm">
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
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-700/50 bg-white dark:bg-primary-800/50 text-primary-800 dark:text-parchment-100 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
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
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-primary-700/50 bg-white dark:bg-primary-800/50 text-primary-800 dark:text-parchment-100 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
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
                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-primary-800 ring-primary-500 dark:ring-primary-400 scale-110"
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
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:dark:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? "Creation..." : "Creer le groupe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
