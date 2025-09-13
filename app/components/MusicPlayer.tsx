"use client";

import { useRef, useState } from "react";

export default function MusicPlayerOverlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current
        .play()
        .then(() => {
          console.log("🎵 Music started");
          setUnlocked(true);
        })
        .catch((err) => console.error("Cannot play audio:", err));
    }
  };

  return (
    <div className="relative min-h-screen">
      <audio ref={audioRef} loop>
        <source src="/a.mp3" type="audio/mpeg" />
      </audio>

      {!unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <button
            onClick={handleStart}
            className="px-12 py-5 text-3xl font-extrabold text-white 
                       bg-red-600 hover:bg-red-700 
                       -skew-x-12 rounded-lg shadow-[0_0_30px_rgba(255,70,85,0.8)]
                       transform hover:scale-110 hover:shadow-[0_0_50px_rgba(255,70,85,1)] 
                       transition-all"
          >
            <span className="inline-block skew-x-12 tracking-wider uppercase">
              Welcome to Valorant Gacha
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
