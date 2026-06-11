"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { translations, useLanguage } from "../lib/i18n";

export default function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07070a]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1640px] items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <motion.span
            className="flex h-11 w-11 items-center justify-center border border-red-400/40 bg-red-500/10 cut-corners"
            whileHover={{ scale: 1.04, filter: "drop-shadow(0 0 14px #ff4655)" }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          >
            <Image src="/vlogo.png" alt="Valorant Logo" width={30} height={30} className="object-contain" />
          </motion.span>
          <span className="truncate text-lg font-black uppercase tracking-[0.08em] text-white sm:text-xl">
            {t.siteName}
          </span>
        </Link>

        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.025] p-1">
          <div
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button
              type="button"
              onClick={() => setAboutOpen((open) => !open)}
              className="flex h-11 items-center gap-2 border border-transparent px-4 text-sm font-bold text-gray-200 transition hover:border-red-400/50 hover:bg-white/[0.04] hover:text-white"
            >
              <Info size={16} />
              <span className="hidden sm:inline">{t.about}</span>
            </button>

            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-3 w-72 border border-white/15 bg-[#11131b] p-4 text-sm leading-relaxed text-gray-200 shadow-2xl"
                >
                  {t.aboutDescription}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="https://github.com/giangbc2k4"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 w-11 items-center justify-center border border-transparent text-gray-300 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white sm:flex"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
