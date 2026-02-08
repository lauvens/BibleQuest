import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classement - BibleEido",
  description: "Comparez votre progression avec les autres joueurs de BibleEido.",
};

export default function ClassementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
