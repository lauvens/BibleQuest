import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-primary-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
            Politique de confidentialite
          </h1>
        </div>
        <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 p-6 text-primary-700 dark:text-primary-300 space-y-4 text-sm leading-relaxed">
          <p>Cette page sera bientot disponible avec notre politique de confidentialite complete.</p>
          <p>En attendant, sachez que nous prenons la protection de vos donnees personnelles tres au serieux. Nous ne partageons jamais vos informations avec des tiers sans votre consentement.</p>
        </div>
      </div>
    </div>
  );
}
