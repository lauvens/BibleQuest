import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Versets - BibleEido",
  description: "Explorez et sauvegardez vos versets bibliques preferes avec notes personnelles.",
};

export default function VersetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
