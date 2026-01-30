import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-parchment-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-800 mb-2">
          Erreur d&apos;authentification
        </h1>
        <p className="text-primary-500 mb-8">
          La connexion a échoué. Veuillez réessayer.
        </p>
        <Link
          href="/connexion"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
