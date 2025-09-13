"use client";
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
}

export default function PlayerCard({
  player,
  role,
  onChange,
  onRoleChange,
  roles,
}: PlayerCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-900 via-black to-gray-900 border border-red-500/30 shadow-lg hover:shadow-[0_0_12px_rgba(255,70,85,0.5)] transition-shadow rounded-sm">
      {/* Player Name Input */}
      <input
        type="text"
        value={player}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Player"
        className="flex-1 px-3 py-2 bg-black/70 border border-red-500/30 text-white font-semibold placeholder-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-500"
      />

      {/* Role Dropdown */}
      <div className="relative ml-3">
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-sm bg-black/70 border border-red-500/30 flex items-center justify-center hover:scale-110 hover:shadow-[0_0_8px_rgba(255,70,85,0.5)] transition-transform"
        >
          <img
            src={roles.find((r) => r.name === role)?.icon || roles[0].icon}
            alt={role}
            className="w-7 h-7"
          />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-32 bg-black/90 border border-red-500/30 rounded-sm shadow-lg z-10">
            {roles.map((r) => (
              <div
                key={r.name}
                className="flex items-center px-2 py-1 hover:bg-red-600 hover:text-white cursor-pointer"
                onClick={() => {
                  onRoleChange(r.name);
                  setOpen(false);
                }}
              >
                <img src={r.icon} alt={r.name} className="w-5 h-5 mr-2" />
                <span className="text-sm">{r.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
