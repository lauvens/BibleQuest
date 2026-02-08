import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bible - BibleEido",
  description: "Lisez la Bible en ligne, sauvegardez vos versets favoris et ajoutez des notes personnelles.",
};

export default function BibleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
