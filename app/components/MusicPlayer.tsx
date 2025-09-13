"use client";

import { useRef, useState } from "react";

export default function MusicPlayerOverlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // chỉnh nhỏ lại
      audioRef.current.play()
        .then(() => {
          console.log("🎵 Music started");
          setUnlocked(true); // ẩn overlay
        })
        .catch(err => console.error("Cannot play audio:", err));
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Audio element */}
      <audio ref={audioRef} loop>
        <source src="/a.mp3" type="audio/mpeg" />
      </audio>

      {/* Overlay hiển thị khi chưa unlock */}
      {!unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            onClick={handleStart}
            className="px-10 py-5 text-2xl font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            ▶ Start Experience
          </button>
        </div>
      )}

      {/* Nội dung trang bình thường */}
      <div className={`${!unlocked ? "pointer-events-none blur-md" : ""}`}>
        <h1 className="text-4xl text-center mt-20 text-red-500 font-extrabold">
          🎮 Welcome to Valorant Gacha
        </h1>
        <p className="text-center text-gray-300 mt-4">
         
        </p>
      </div>
    </div>
  );
}
