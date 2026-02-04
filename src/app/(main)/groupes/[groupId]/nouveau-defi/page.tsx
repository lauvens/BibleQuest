"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/user-store";
import { createChallenge } from "@/lib/supabase/queries";

// Liste simplifiée des livres de la Bible
const bibleBooks = [
  "Genese", "Exode", "Levitique", "Nombres", "Deuteronome",
  "Josue", "Juges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques",
  "Esdras", "Nehemie", "Esther", "Job", "Psaumes",
  "Proverbes", "Ecclesiaste", "Cantique", "Esaie", "Jeremie",
  "Lamentations", "Ezechiel", "Daniel", "Osee", "Joel",
  "Amos", "Abdias", "Jonas", "Michee", "Nahum",
  "Habacuc", "Sophonie", "Aggee", "Zacharie", "Malachie",
  "Matthieu", "Marc", "Luc", "Jean", "Actes",
  "Romains", "1 Corinthiens", "2 Corinthiens", "Galates",
  "Ephesiens", "Philippiens", "Colossiens", "1 Thessaloniciens",
  "2 Thessaloniciens", "1 Timothee", "2 Timothee", "Tite",
  "Philemon", "Hebreux", "Jacques", "1 Pierre", "2 Pierre",
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
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeadline(tomorrow.toISOString().split("T")[0]);
  }, []);

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
