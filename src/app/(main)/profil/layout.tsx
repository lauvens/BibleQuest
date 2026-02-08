import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil - BibleEido",
  description: "Votre profil BibleEido: statistiques, succes, cosmetiques et parametres.",
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
