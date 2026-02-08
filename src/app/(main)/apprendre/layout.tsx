import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apprendre - BibleEido",
  description: "Parcours d'apprentissage interactifs pour decouvrir la Bible, ses doctrines et son histoire.",
};

export default function ApprendreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
