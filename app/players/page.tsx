"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlayerCard from "./PlayerBox";

interface Role {
  name: string;
  icon: string;
}

// Icon role Valorant dùng local
const roles: Role[] = [
  { name: "Duelist", icon: "/icons/Du.png" },
  { name: "Initiator", icon: "/icons/Ini.png" },
  { name: "Sentinel", icon: "/icons/Sen.png" },
  { name: "Controller", icon: "/icons/Col.png" },
  { name: "Random", icon: "/10.png" }, // icon random
];

export default function PlayersPage() {
  const router = useRouter();
  const [teamCount, setTeamCount] = useState<1 | 2>(1);
  const [players, setPlayers] = useState<string[]>(Array(5).fill(""));
  const [playerRoles, setPlayerRoles] = useState<string[]>(Array(5).fill("Random"));

  const handleTeamCount = (count: 1 | 2) => {
    setTeamCount(count);
    const totalPlayers = count === 1 ? 5 : 10;

    setPlayers((prev) => {
      const newArr = [...prev];
      while (newArr.length < totalPlayers) newArr.push("");
      return newArr.slice(0, totalPlayers);
    });

    setPlayerRoles((prev) => {
      const newArr = [...prev];
      while (newArr.length < totalPlayers) newArr.push("Random");
      return newArr.slice(0, totalPlayers);
    });
  };

  const handleSubmit = () => {
    const finalPlayers = players.map((p, i) => p.trim() || `Player ${i + 1}`);
    localStorage.setItem("players", JSON.stringify(finalPlayers));
    localStorage.setItem("roles", JSON.stringify(playerRoles));
    router.push("/result");
  };

  return (
    <main className="flex flex-col items-center py-10 px-6 bg-valorant-dark min-h-screen text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-red-500">
        STEP 1: Assemble your team
      </h2>
      <p className="text-gray-400 mb-8 text-center max-w-lg">
        Enter the names of the {teamCount * 5} players. Choose roles or let it be random.
      </p>

      {/* Team selection */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => handleTeamCount(1)}
          className={`px-4 py-2 font-semibold rounded-sm border ${
            teamCount === 1 ? "bg-red-600 border-red-500" : "border-red-500/50"
          } hover:bg-red-700 transition-colors`}
        >
          1 Team
        </button>
        <button
          onClick={() => handleTeamCount(2)}
          className={`px-4 py-2 font-semibold rounded-sm border ${
            teamCount === 2 ? "bg-red-600 border-red-500" : "border-red-500/50"
          } hover:bg-red-700 transition-colors`}
        >
          2 Teams
        </button>
      </div>

      {/* Players Grid */}
      <div
        className={`grid gap-4 w-full max-w-5xl ${
          teamCount === 1 ? "grid-cols-1 md:grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {(teamCount === 1
          ? [players]
          : [players.slice(0, 5), players.slice(5, 10)]
        ).map((teamPlayers, teamIdx) => (
          <div key={teamIdx} className="space-y-4">
            {teamPlayers.map((p, idx) => {
              const globalIdx = teamIdx * 5 + idx;
              return (
                <PlayerCard
                  key={globalIdx}
                  player={players[globalIdx]}
                  role={playerRoles[globalIdx]}
                  roles={roles}
                  onChange={(val) =>
                    setPlayers((prev) => {
                      const newArr = [...prev];
                      newArr[globalIdx] = val;
                      return newArr;
                    })
                  }
                  onRoleChange={(val) =>
                    setPlayerRoles((prev) => {
                      const newArr = [...prev];
                      newArr[globalIdx] = val;
                      return newArr;
                    })
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition-all"
      >
        NEXT
        <img src="/ar.png" alt="Confirm" className="w-5 h-5" />
      </button>
    </main>
  );
}
