import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Defis - BibleEido",
  description: "Relevez des defis quotidiens et testez vos connaissances bibliques.",
};

export default function DefiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
