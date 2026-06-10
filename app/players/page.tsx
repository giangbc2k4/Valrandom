"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
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
  const [players, setPlayers] = useState<string[]>(Array(10).fill(""));
  const [playerRoles, setPlayerRoles] = useState<string[]>(Array(10).fill("Random"));
  const searchParams = useSearchParams();
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (prefilled) return;

    const data = searchParams.get("data");
    if (!data) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(data)) as {
        teams?: Array<Array<{ name: string }>>;
      };

      if (!decoded.teams || !Array.isArray(decoded.teams)) return;

      const teamA = decoded.teams[0] ?? [];
      const teamB = decoded.teams[1] ?? [];
      const filled = Array(10).fill("");

      teamA.slice(0, 5).forEach((p, idx) => {
        filled[idx] = p.name;
      });
      teamB.slice(0, 5).forEach((p, idx) => {
        filled[idx + 5] = p.name;
      });

      setPlayers(filled);
      setPlayerRoles(Array(10).fill("Random"));
      setTeamCount(teamB.length > 0 ? 2 : 1);
      setPrefilled(true);
    } catch {
      // Keep the manual empty form when shared data is invalid.
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
    <main className="relative min-h-screen overflow-hidden bg-valorant-dark px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 tactical-grid opacity-35" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_320px]">
        <section className="panel cut-corners p-5 sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <h1 className="valorant-title text-3xl text-white">{t.playersPageTitle}</h1>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-gray-400">
                {t.playersPageHint}
              </p>
            </div>

            <div className="flex w-full border border-white/10 bg-black/35 p-1 md:w-auto">
              {([1, 2] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTeamCount(count)}
                  className={`flex-1 px-5 py-2 text-sm font-black uppercase tracking-[0.08em] transition md:flex-none ${
                    teamCount === count
                      ? "bg-red-500 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {count === 1 ? t.teamModeOne : t.teamModeTwo}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-5 ${teamCount === 1 ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"}`}>
            {teams.map((teamPlayers, teamIdx) => (
              <div
                key={teamIdx}
                className={`border p-4 ${
                  teamIdx === 0
                    ? "border-red-400/35 bg-red-500/[0.08]"
                    : "border-blue-400/35 bg-blue-500/[0.08]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    className={`text-lg font-black uppercase tracking-[0.08em] ${
                      teamIdx === 0 ? "text-red-300" : "text-blue-300"
                    }`}
                  >
                    {teamIdx === 0 ? t.teamA : t.teamB}
                  </h2>
                  <span className="text-xs font-bold text-gray-400">
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

          <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
            <p className="max-w-lg whitespace-pre-line text-xs leading-5 text-gray-500">{t.playersPageTip}</p>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 bg-red-500 px-6 py-3 font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-400 md:w-auto"
            >
              {t.nextStep}
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <aside className="panel-strong cut-corners h-fit p-5">
          <h2 className="valorant-title text-xl text-white">{t.roleGuideTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">{t.roleGuideHint}</p>

          <div className="mt-5 space-y-2">
            {roles.map((role) => (
              <div key={role.name} className="flex items-center gap-3 border border-white/10 bg-black/30 px-3 py-3">
                <Image
                  src={role.icon}
                  alt={role.name}
                  width={28}
                  height={28}
                  className={role.name === "Random" ? "rounded-full bg-white/15 p-1" : ""}
                />
                <span className="font-semibold text-gray-200">{role.name}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 border-l-2 border-red-400 pl-4 text-xs leading-5 text-gray-500">
            {t.roleRandomNote}
          </p>
        </aside>
      </div>
    </main>
  );
}

export default function PlayersPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-valorant-dark text-white">
          <div className="text-xl">{t.loading}</div>
        </div>
      }
    >
      <PlayersContent />
    </Suspense>
  );
}
