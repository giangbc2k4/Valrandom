// app/layout.tsx
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; // client component
import MusicPlayer from "./components/MusicPlayer";
const beVietnam = Be_Vietnam_Pro({
  weight: ["400","600","700"],
  subsets: ["vietnamese"],
});

export const metadata: Metadata = {
  title: "Valorant Gacha",
  description: "Fanmade Valorant Random Team Generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.className} flex flex-col min-h-screen bg-valorant-dark text-white`}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-gray-400 border-t border-white/10">
         
        <MusicPlayer />
        </footer>
      </body>
    </html>
  );
}
