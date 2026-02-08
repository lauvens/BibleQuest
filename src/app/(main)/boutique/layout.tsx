import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique - BibleEido",
  description: "Achetez des coeurs, cosmetiques et bonus avec vos pieces et gemmes.",
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
