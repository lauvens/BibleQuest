"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(pw)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(pw)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  const sanitizeUsername = (name: string) =>
    name.replace(/[^a-zA-Z0-9À-ÿ_-]/g, "").slice(0, 30);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      setLoading(false);
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user && !data.session) {
      // Email confirmation required
      setEmailSent(true);
      setLoading(false);
    } else {
      // Email confirmation disabled, user is signed in
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Show email confirmation message
  if (emailSent) {
    return (
      <div className="bg-parchment-50 dark:bg-primary-800 rounded-2xl shadow-elevated p-8 border border-parchment-300 dark:border-primary-800 text-center">
        <div className="w-16 h-16 rounded-full bg-olive-100 dark:bg-olive-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-olive-600 dark:text-olive-400" />
        </div>
        <h1 className="text-2xl font-bold text-primary-800 dark:text-parchment-50 mb-2">
          Vérifiez votre email
        </h1>
        <p className="text-primary-600 dark:text-primary-300 mb-4">
          Nous avons envoyé un lien de confirmation à
        </p>
        <p className="font-semibold text-primary-800 dark:text-parchment-100 mb-6">
          {email}
        </p>
        <div className="bg-gold-50 dark:bg-gold-500/10 border border-gold-200 dark:border-gold-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-gold-600 dark:text-gold-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary-700 dark:text-primary-200 text-left">
              Cliquez sur le lien dans l&apos;email pour activer votre compte et commencer votre aventure biblique!
            </p>
          </div>
        </div>
        <p className="text-sm text-primary-400 dark:text-primary-500">
          Vous n&apos;avez pas reçu l&apos;email?{" "}
          <button
            onClick={() => setEmailSent(false)}
            className="text-olive-600 dark:text-olive-400 hover:underline font-medium"
          >
            Réessayer
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-parchment-50 dark:bg-primary-800 rounded-2xl shadow-elevated p-8 border border-parchment-300 dark:border-primary-800">
      <h1 className="text-2xl font-bold text-center text-primary-800 dark:text-parchment-50 mb-2">
        Creer un compte
      </h1>
      <p className="text-center text-primary-500 dark:text-primary-300 mb-6">
        Commencez votre aventure biblique
      </p>

      {error && (
        <div className="bg-error-50 dark:bg-error-500/20 text-error-600 dark:text-error-500 p-3 rounded-xl mb-4 text-sm border border-error-200 dark:border-error-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-1">
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
            className="input"
            minLength={3}
            maxLength={30}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            minLength={8}
            required
          />
          <p className="text-xs text-primary-400 dark:text-primary-500 mt-1">Minimum 8 caracteres, 1 majuscule, 1 chiffre</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-parchment-300 dark:border-primary-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-parchment-50 dark:bg-primary-800 text-primary-400">ou</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        S&apos;inscrire avec Google
      </button>

      <p className="text-center text-sm text-primary-500 dark:text-primary-400 mt-6">
        Deja un compte?{" "}
        <Link href="/connexion" className="text-olive-600 dark:text-olive-400 hover:underline font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
