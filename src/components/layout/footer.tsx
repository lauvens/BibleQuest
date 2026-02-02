"use client";

import Link from "next/link";
import { BookOpen, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const navigation = {
  main: [
    { name: "Bible", href: "/bible" },
    { name: "Parcours", href: "/parcours" },
    { name: "Défi", href: "/defi" },
    { name: "Classement", href: "/classement" },
  ],
  legal: [
    { name: "Confidentialité", href: "/confidentialite" },
    { name: "Conditions", href: "/conditions" },
    { name: "Contact", href: "/contact" },
  ],
  social: [
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com", icon: Youtube },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FadeIn>
      <footer className="bg-primary-900 dark:bg-primary-950 text-white mt-16">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-900" />
                </div>
                <span className="text-xl font-bold">BibleEidó</span>
              </Link>
              <p className="text-white/60 mb-4 max-w-sm">
                Apprenez la Bible de manière interactive et ludique.
                Mémorisez des versets, suivez des parcours et grandissez dans votre foi.
              </p>

              {/* Newsletter */}
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent-400 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-400 text-primary-900 font-semibold hover:bg-accent-300 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-white/40 text-sm">
              © {currentYear} BibleEidó. Tous droits réservés.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5 text-white/60" />
                </a>
              ))}
            </div>

            {/* Version */}
            <p className="text-white/40 text-sm">
              v0.1.0
            </p>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}
