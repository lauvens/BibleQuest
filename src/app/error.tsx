"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-error-100 dark:bg-error-900/40 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12 text-error-500 dark:text-error-400" />
        </div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-primary-500 dark:text-primary-400 mb-8">
          Quelque chose ne s&apos;est pas passe comme prevu. Veuillez reessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 dark:hover:bg-primary-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-parchment-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-xl font-medium hover:bg-parchment-300 dark:hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
