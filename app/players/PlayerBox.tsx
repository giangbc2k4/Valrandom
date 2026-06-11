"use client";

interface PlayerCardProps {
  player: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PlayerCard({
  player,
  onChange,
  placeholder = "Player",
}: PlayerCardProps) {
  return (
    <div className="relative border border-white/10 bg-black/35 p-3 transition hover:border-red-400/50">
      <input
        type="text"
        value={player}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-white/10 bg-[#101119] px-3 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-gray-500 focus:border-red-400"
      />
    </div>
  );
}
