import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";

export default function ContactPage() {
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
          <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50">
            Contact
          </h1>
        </div>
        <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 p-6 text-primary-700 dark:text-primary-300 space-y-4 text-sm leading-relaxed">
          <p>Vous avez une question, une suggestion ou un probleme ?</p>
          <p>Contactez-nous par email a <a href="mailto:contact@bibleeido.com" className="text-primary-600 dark:text-accent-400 hover:underline font-medium">contact@bibleeido.com</a></p>
          <p>Nous vous repondrons dans les plus brefs delais.</p>
        </div>
      </div>
    </div>
  );
}
