import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InkBook — Agendamento Online para Tatuadores e Barbeiros",
    template: "%s | InkBook",
  },
  description:
    "Plataforma de agendamento online para tatuadores, barbeiros, salões de beleza e profissionais de estética. Marque em 3 cliques, sem vai-e-volta no WhatsApp.",
  keywords: ["agendamento online", "tatuagem", "barbearia", "salão de beleza", "inkbook"],
  authors: [{ name: "InkBook" }],
  creator: "InkBook",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.app"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "InkBook",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InkBook",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
