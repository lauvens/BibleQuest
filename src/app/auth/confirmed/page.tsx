"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/apprendre");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-parchment-subtle flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-olive-100 dark:bg-olive-500/20 flex items-center justify-center animate-success">
            <CheckCircle className="w-12 h-12 text-olive-600 dark:text-olive-400" />
          </div>
          <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-gold-500 animate-pulse" />
          <Sparkles className="absolute bottom-2 left-1/4 w-5 h-5 text-gold-400 animate-pulse delay-150" />
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-primary-800 dark:text-parchment-50 mb-3">
          Email confirmé!
        </h1>
        <p className="text-lg text-primary-600 dark:text-primary-300 mb-6">
          Votre compte BibleEidó est maintenant actif.
        </p>

        {/* Features preview */}
        <div className="bg-parchment-50 dark:bg-primary-800 rounded-2xl p-6 mb-6 border border-parchment-300 dark:border-primary-700">
          <p className="text-sm text-primary-500 dark:text-primary-400 mb-4">
            Vous pouvez maintenant:
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-olive-100 dark:bg-olive-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-olive-600 dark:text-olive-400" />
              </div>
              <span className="text-primary-700 dark:text-primary-200">
                Apprendre avec des leçons interactives
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-500/20 flex items-center justify-center">
                <span className="text-base">🔥</span>
              </div>
              <span className="text-primary-700 dark:text-primary-200">
                Construire des séries quotidiennes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-info-100 dark:bg-info-500/20 flex items-center justify-center">
                <span className="text-base">🏆</span>
              </div>
              <span className="text-primary-700 dark:text-primary-200">
                Débloquer des achievements
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/apprendre">
          <Button size="lg" className="w-full mb-4">
            Commencer à apprendre
          </Button>
        </Link>

        <p className="text-sm text-primary-400 dark:text-primary-500">
          Redirection automatique dans {countdown}s...
        </p>
      </div>
    </div>
  );
}
