import type { Metadata } from "next";
import { Nunito, Fredoka, JetBrains_Mono, Sour_Gummy } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import CtfConsole from "@/components/CtfConsole";

/* Headline display — Fredoka, font rounded bold ala logo */
const fredoka = Fredoka({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Hero headline khusus — Sour Gummy */
const sourGummy = Sour_Gummy({
  variable: "--font-sour-gummy",
  subsets: ["latin"],
  weight: ["900"],
});

/* Body + Display — Nunito, rounded friendly */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

/* Mono — dipertahankan untuk elemen teknikal CTF, badge, dll */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Kelas Cyber Security — XI TKJ 3 Morpheus",
  description:
    "Website resmi kelas ekspertise Cyber Security SMK Telkom Malang. Galeri kegiatan, profil anggota, dan jadwal piket kelas XI TKJ 3 Morpheus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fredoka.variable} ${nunito.variable} ${jetbrainsMono.variable} ${sourGummy.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-base text-ink font-body">
        {children}
        <ChatbotWidget />
        <CtfConsole /> {/* invisible — CTF flag Part 2 di console */}
      </body>
    </html>
  );
}
