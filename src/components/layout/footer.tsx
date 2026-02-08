"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Twitter } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const navigation = {
  main: [
    { name: "Bible", href: "/bible" },
    { name: "Apprendre", href: "/apprendre" },
    { name: "Groupes", href: "/groupes" },
    { name: "Classement", href: "/classement" },
  ],
  social: [
    { name: "Instagram", href: "https://instagram.com/bibleeido", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com/@bibleeido", icon: Youtube },
    { name: "Twitter", href: "https://twitter.com/bibleeido", icon: Twitter },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FadeIn>
      <footer className="bg-primary-900 dark:bg-primary-950 text-white mt-16">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo-white.png"
                  alt="BibleEidó"
                  width={40}
                  height={40}
                />
                <span className="text-xl font-bold">BibleEidó</span>
              </Link>
              <p className="text-white/60 max-w-sm">
                Apprenez la Bible de manière interactive et ludique.
                Mémorisez des versets, suivez des parcours et grandissez dans votre foi.
              </p>
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
