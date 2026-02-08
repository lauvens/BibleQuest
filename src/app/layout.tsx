import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { LevelUpModal } from "@/components/game/level-up-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "BibleEido - Apprenez la Bible en vous amusant",
    template: "%s | BibleEido",
  },
  description:
    "Application gamifiee pour apprendre l'histoire, le contexte et les versets de la Bible de maniere interactive et ludique.",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "BibleEido",
    title: "BibleEido - Apprenez la Bible en vous amusant",
    description:
      "Application gamifiee pour apprendre l'histoire, le contexte et les versets de la Bible de maniere interactive et ludique.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BibleEido - Apprenez la Bible en vous amusant",
    description:
      "Application gamifiee pour apprendre la Bible de maniere interactive.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3B82C4" />
        <meta name="apple-mobile-web-app-title" content="BibleEido" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <LevelUpModal />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
