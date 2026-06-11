"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerCard from "./PlayerBox";
import { translations, useLanguage } from "../lib/i18n";

function PlayersContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [teamCount, setTeamCount] = useState<1 | 2>(1);
  const [teamNames, setTeamNames] = useState(["Team A", "Team B"]);
  const [players, setPlayers] = useState<string[]>(Array(10).fill(""));
  const searchParams = useSearchParams();
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (prefilled) return;

    const data = searchParams.get("data");
    if (!data) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(data)) as {
        teams?: Array<Array<{ name: string }>>;
        teamNames?: string[];
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
      if (decoded.teamNames?.length) {
        setTeamNames([
          decoded.teamNames[0] || "Team A",
          decoded.teamNames[1] || "Team B",
        ]);
      }
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

    const finalRoles = Array(totalPlayers).fill("Random");

    localStorage.setItem("players", JSON.stringify(finalPlayers));
    localStorage.setItem("roles", JSON.stringify(finalRoles));
    localStorage.setItem("teamNames", JSON.stringify(teamNames.slice(0, teamCount)));

    router.push("/result");
  };

  const teams =
    teamCount === 1
      ? [players.slice(0, 5)]
      : [players.slice(0, 5), players.slice(5, 10)];

  return (
    <main className="relative min-h-screen overflow-hidden bg-valorant-dark px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 tactical-grid opacity-35" />

      <div className="relative z-10 mx-auto max-w-5xl">
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
                    {teamNames[teamIdx] || (teamIdx === 0 ? t.teamA : t.teamB)}
                  </h2>
                  <span className="text-xs font-bold text-gray-400">
                    {teamPlayers.filter(Boolean).length}/5
                  </span>
                </div>

                <label className="mb-4 block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                    Team name
                  </span>
                  <input
                    type="text"
                    value={teamNames[teamIdx] ?? ""}
                    onChange={(event) =>
                      setTeamNames((prev) => {
                        const next = [...prev];
                        next[teamIdx] = event.target.value;
                        return next;
                      })
                    }
                    placeholder={teamIdx === 0 ? t.teamA : t.teamB}
                    className={`w-full border bg-[#101119] px-3 py-2.5 text-sm font-black uppercase tracking-[0.06em] text-white outline-none transition placeholder:text-gray-600 ${
                      teamIdx === 0
                        ? "border-red-400/25 focus:border-red-300"
                        : "border-blue-400/25 focus:border-blue-300"
                    }`}
                  />
                </label>

                <div className="space-y-3">
                  {teamPlayers.map((p, idx) => {
                    const globalIdx = teamIdx * 5 + idx;

                    return (
                      <PlayerCard
                        key={globalIdx}
                        player={players[globalIdx]}
                        placeholder={t.placeholderPlayer}
                        onChange={(val) =>
                          setPlayers((prev) => {
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
