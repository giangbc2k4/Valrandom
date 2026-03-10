"use client";

import { useRouter } from "next/navigation";
import { translations, useLanguage } from "./lib/i18n";

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center px-6 py-10 mx-auto">
      {/* Hero */}
      <div className="w-full bg-gradient-to-r from-red-900 via-black to-gray-900 rounded-xl p-10 mb-12 shadow-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(255,70,85,0.8)]">
          {t.heroTitle}
        </h1>

        <p className="text-gray-300 text-lg md:text-xl">{t.heroSubtitle}</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Random Team Mode */}
        <div
          onClick={() => router.push("/teams")}
          className="cursor-pointer bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg hover:scale-105 hover:shadow-[0_0_25px_rgba(255,70,85,0.6)] transition flex flex-col h-[260px] overflow-hidden"
        >
          <div className="flex-1 overflow-hidden">
            <div className="text-5xl mb-4">👥</div>

            <h2 className="text-2xl font-bold text-red-400 mb-3">{t.randomTeams}</h2>

            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{t.modeTeams}</p>
          </div>

          <div className="mt-6 text-red-400 font-bold whitespace-nowrap">{t.start}</div>
        </div>

        {/* Random Agent Mode */}
        <div
          onClick={() => router.push("/players")}
          className="cursor-pointer bg-white/5 border border-white/10 rounded-xl p-8 shadow-lg hover:scale-105 hover:shadow-[0_0_25px_rgba(150,80,255,0.6)] transition flex flex-col h-[260px] overflow-hidden"
        >
          <div className="flex-1 overflow-hidden">
            <div className="text-5xl mb-4">🎲</div>

            <h2 className="text-2xl font-bold text-purple-400 mb-3">{t.randomAgents}</h2>

            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{t.modeAgents}</p>
          </div>

          <div className="mt-6 text-purple-400 font-bold whitespace-nowrap">{t.start}</div>
        </div>
      </div>
    </div>
  );
}
