import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📜</span>
        </div>
        <h1 className="text-4xl font-bold text-primary-800 dark:text-parchment-50 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-4">
          Page introuvable
        </h2>
        <p className="text-primary-500 dark:text-primary-400 mb-8">
          Cette page semble avoir ete perdue dans les sables du temps.
          Retournez sur le chemin principal.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 dark:hover:bg-primary-400 transition-colors"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
