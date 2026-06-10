"use client";

import { useRef, useState } from "react";

export default function MusicPlayerOverlay() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const handleStart = () => {
    if (!audioRef.current) return;

    audioRef.current.volume = 0.1;
    audioRef.current
      .play()
      .then(() => {
        console.log("Music started");
        setUnlocked(true);
      })
      .catch((err) => console.error("Cannot play audio:", err));
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/a.mp3" type="audio/mpeg" />
      </audio>

      {!unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={handleStart}
            className="cut-corners border border-red-300/40 bg-red-500 px-8 py-4 text-xl font-black uppercase tracking-[0.12em] text-white shadow-[0_0_34px_rgba(255,70,85,0.45)] transition hover:bg-red-400 sm:px-12 sm:py-5 sm:text-2xl"
          >
            Welcome to Valorant Random
          </button>
        </div>
      )}
    </>
  );
}
