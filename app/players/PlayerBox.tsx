"use client";

import Image from "next/image";
import { useState } from "react";

interface Role {
  name: string;
  icon: string;
}

interface PlayerCardProps {
  player: string;
  role: string;
  onChange: (value: string) => void;
  onRoleChange: (role: string) => void;
  roles: Role[];
  placeholder?: string;
}

export default function PlayerCard({
  player,
  role,
  onChange,
  onRoleChange,
  roles,
  placeholder = "Player",
}: PlayerCardProps) {
  const [open, setOpen] = useState(false);
  const selectedRole = roles.find((r) => r.name === role) || roles[0];

  return (
    <div className="relative flex items-center gap-3 border border-white/10 bg-black/35 p-3 transition hover:border-red-400/50">
      <input
        type="text"
        value={player}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border border-white/10 bg-[#101119] px-3 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-gray-500 focus:border-red-400"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center border border-red-400/30 bg-red-500/10 transition hover:border-red-300 hover:bg-red-500/20"
          aria-label={`Role: ${selectedRole.name}`}
        >
          <Image
            src={selectedRole.icon}
            alt={selectedRole.name}
            width={28}
            height={28}
            className={selectedRole.name === "Random" ? "rounded-full bg-white/15 p-1" : ""}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-20 mt-2 w-40 border border-white/15 bg-[#101119] p-1 shadow-2xl">
            {roles.map((r) => (
              <button
                key={r.name}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-red-500 hover:text-white"
                onClick={() => {
                  onRoleChange(r.name);
                  setOpen(false);
                }}
              >
                <Image
                  src={r.icon}
                  alt={r.name}
                  width={22}
                  height={22}
                  className={r.name === "Random" ? "rounded-full bg-white/15 p-1" : ""}
                />
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
