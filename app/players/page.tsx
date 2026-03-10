"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerCard from "./PlayerBox";
import { translations, useLanguage } from "../lib/i18n";

interface Role {
  name: string;
  icon: string;
}

const roles: Role[] = [
  { name: "Duelist", icon: "/Roles/Du.png" },
  { name: "Initiator", icon: "/Roles/Ini.png" },
  { name: "Sentinel", icon: "/Roles/Sen.png" },
  { name: "Controller", icon: "/Roles/Col.png" },
  { name: "Random", icon: "/Roles/random.png" },
];

function PlayersContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [teamCount, setTeamCount] = useState<1 | 2>(1);

  // luôn giữ 10 slot nội bộ
  const [players, setPlayers] = useState<string[]>(Array(10).fill(""));
  const [playerRoles, setPlayerRoles] = useState<string[]>(Array(10).fill("Random"));
  const searchParams = useSearchParams();
  const [prefilled, setPrefilled] = useState(false);

  const handleTeamCount = (count: 1 | 2) => {
    setTeamCount(count);
  };

  useEffect(() => {
    if (prefilled) return;

    const data = searchParams.get("data");
    if (!data) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(data)) as {
        teams?: Array<Array<{ name: string }>>;
      };

      if (!decoded.teams || !Array.isArray(decoded.teams)) return;

      const teams = decoded.teams;
      const teamA = teams[0] ?? [];
      const teamB = teams[1] ?? [];

      const allNames = [
        ...teamA.map((p) => p.name),
        ...teamB.map((p) => p.name),
      ];

      const filled = Array(10)
        .fill("")
        .map((_, idx) => allNames[idx] ?? "");

      setPlayers(filled);
      setPlayerRoles(Array(10).fill("Random"));
      setTeamCount(teamB.length > 0 ? 2 : 1);
      setPrefilled(true);
    } catch {
      // ignore
    }
  }, [searchParams, prefilled]);

  const handleSubmit = () => {
    const totalPlayers = teamCount === 1 ? 5 : 10;

    const finalPlayers = players
      .slice(0, totalPlayers)
      .map((p, i) => p.trim() || `${t.defaultPlayer} ${i + 1}`);

    const finalRoles = playerRoles.slice(0, totalPlayers);

    localStorage.setItem("players", JSON.stringify(finalPlayers));
    localStorage.setItem("roles", JSON.stringify(finalRoles));

    router.push("/result");
  };

  const teams =
    teamCount === 1
      ? [players.slice(0, 5)]
      : [players.slice(0, 5), players.slice(5, 10)];

  return (
    <main className="flex flex-col items-center py-10 px-6 bg-valorant-dark min-h-screen text-white">
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-500">
        {t.playersPageTitle}
      </h2>

      {/* Guide */}
      <div className="text-gray-400 text-center max-w-xl mb-8 text-sm leading-relaxed">
        {t.playersPageHint.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </div>

      {/* Team Mode */}
      <div className="flex space-x-4 mb-10">
        <button
          onClick={() => handleTeamCount(1)}
          className={`px-5 py-2 font-semibold rounded-sm border transition-colors ${
            teamCount === 1
              ? "bg-red-600 border-red-500"
              : "border-red-500/40 hover:bg-red-600/40"
          }`}
        >
          {t.teamModeOne}
        </button>

        <button
          onClick={() => handleTeamCount(2)}
          className={`px-5 py-2 font-semibold rounded-sm border transition-colors ${
            teamCount === 2
              ? "bg-red-600 border-red-500"
              : "border-red-500/40 hover:bg-red-600/40"
          }`}
        >
          {t.teamModeTwo}
        </button>
      </div>

      {/* Players Group */}
      <div className="w-full max-w-5xl bg-[#0f0f12] border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,0,0,0.12)] mb-10">
        <div
          className={`grid gap-6 ${
            teamCount === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {teams.map((teamPlayers, teamIdx) => (
            <div
              key={teamIdx}
              className={`flex flex-col rounded-2xl p-6 shadow-lg border-2 ${
                teamIdx === 0
                  ? "border-red-500 bg-black/40"
                  : "border-blue-500 bg-black/40"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                {teamCount === 2 ? (
                  <h3
                    className={`text-xl font-bold ${
                      teamIdx === 0 ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    {teamIdx === 0 ? t.teamA : t.teamB}
                  </h3>
                ) : (
                  <h3 className="text-xl font-bold text-red-400">{t.teamA}</h3>
                )}
                <span className="text-xs text-gray-400">
                  {teamPlayers.filter(Boolean).length}/5
                </span>
              </div>

              <div className="space-y-3">
                {teamPlayers.map((p, idx) => {
                  const globalIdx = teamIdx * 5 + idx;

                  return (
                    <PlayerCard
                      key={globalIdx}
                      player={players[globalIdx]}
                      role={playerRoles[globalIdx]}
                      placeholder={t.placeholderPlayer}
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
            </div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="text-gray-500 text-xs mt-8 text-center max-w-lg">
        {t.playersPageTip.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleSubmit}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition-all"
      >
        {t.nextStep}
      
      </button>
    </main>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-valorant-dark text-white">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <PlayersContent />
    </Suspense>
  );
}
