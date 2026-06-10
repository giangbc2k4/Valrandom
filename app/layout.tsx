// app/layout.tsx
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import MusicPlayer from "./components/MusicPlayer";
import { LanguageProvider } from "./lib/i18n";

const beVietnam = Be_Vietnam_Pro({
  weight: ["400","600","700"],
  subsets: ["vietnamese"],
});

export const metadata: Metadata = {
  title: "Valorant Random",
  description: "Generate random Valorant teams, agents and maps for your custom games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.className} min-h-screen bg-valorant-dark text-white antialiased`}>
        <LanguageProvider>
          <Header />
          {children}
          <MusicPlayer />
        </LanguageProvider>
      </body>
    </html>
  );
}
