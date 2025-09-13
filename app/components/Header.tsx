"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black/40 border-b border-white/10 relative">
      {/* Logo Valorant với hover glow */}
      <Link href="/" className="flex items-center space-x-2">
        <motion.img
          src="/vlogo.png"
          alt="Valorant Logo"
          className="w-10 h-10 object-contain"
          whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 10px #ff4655)" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <span className="text-red-500 font-extrabold text-xl md:text-2xl">Valorant Gacha</span>
      </Link>

      {/* About + Icons */}
      <div className="flex items-center space-x-4 relative">
        {/* About button */}
        <button
          onClick={() => setAboutOpen(!aboutOpen)}
          onMouseEnter={() => setAboutOpen(true)}
          onMouseLeave={() => setAboutOpen(false)}
          className="text-gray-300 hover:text-white font-semibold relative"
        >
          About
          <AnimatePresence>
            {aboutOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-900 border border-white/20 rounded-md p-4 shadow-lg text-gray-200 z-20"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-3 h-3 bg-gray-900 rotate-45 border-l border-t border-white/20"></div>
                Đây là dự án fanmade giúp bạn tạo đội ngẫu nhiên trong Valorant. 
                Hệ thống đảm bảo cân bằng vai trò, và thêm một chút may mắn cho các trận đấu của bạn!
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* GitHub */}
        <a href="https://github.com/giangbc2k4" target="_blank" rel="noopener noreferrer">
          <motion.svg 
            className="w-6 h-6 text-gray-300"
            fill="currentColor" viewBox="0 0 24 24"
            whileHover={{ scale: 1.25, color: "#fff", filter: "drop-shadow(0 0 8px #fff)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577v-2.165c-3.338.725-4.033-1.613-4.033-1.613-.546-1.387-1.334-1.756-1.334-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.335-5.466-5.933 0-1.31.468-2.38 1.236-3.22-.124-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.046.137 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.65.243 2.872.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.805 5.625-5.475 5.922.43.37.823 1.096.823 2.21v3.277c0 .32.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/>
          </motion.svg>
        </a>

        {/* Discord */}
        <a href="https://discord.com/users/jangtran2101" target="_blank" rel="noopener noreferrer">
          <motion.svg
            className="w-6 h-6 text-gray-300"
            viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            whileHover={{ scale: 1.25, color: "#fff", filter: "drop-shadow(0 0 8px #fff)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <path d="M60.104 4.552A58.78 58.78 0 0046.852.184a41.44 41.44 0 00-1.933 4.01 55.85 55.85 0 00-16.918 0 41.04 41.04 0 00-1.944-4.01 58.85 58.85 0 00-13.251 4.368C4.75 20.53 1.865 36.144 2.575 51.6a59.98 59.98 0 0018.007 4.602 44.93 44.93 0 003.888-6.34 39.527 39.527 0 01-6.187-2.93c.519-.383.993-.783 1.433-1.198 12.07 5.633 25.12 5.633 37.11 0 .435.415.91.815 1.433 1.198a39.607 39.607 0 01-6.188 2.93 44.96 44.96 0 003.888 6.34 59.98 59.98 0 0018.007-4.602c1.173-15.653-2.692-31.267-12.394-47.048zM23.725 37.95c-3.022 0-5.503-2.779-5.503-6.187 0-3.408 2.444-6.187 5.503-6.187 3.075 0 5.54 2.779 5.503 6.187 0 3.408-2.444 6.187-5.503 6.187zm23.55 0c-3.022 0-5.503-2.779-5.503-6.187 0-3.408 2.444-6.187 5.503-6.187 3.075 0 5.54 2.779 5.503 6.187 0 3.408-2.444 6.187-5.503 6.187z"/>
          </motion.svg>
        </a>
      </div>
    </header>
  );
}
