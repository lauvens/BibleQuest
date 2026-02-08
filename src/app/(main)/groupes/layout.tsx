import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groupes - BibleEido",
  description: "Rejoignez des groupes de lecture biblique, discutez et relevez des defis ensemble.",
};

export default function GroupesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
