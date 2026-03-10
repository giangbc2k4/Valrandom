"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Player, TeamLock } from "../lib/types";
import { generateTeams } from "../lib/teamRandomizer";
import { assignAgents, PlayerChoice } from "../lib/assignAgents";
import { translations, useLanguage } from "../lib/i18n";

export default function PlayersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function addPlayer() {
    if (!input.trim()) {
      showToast(t.enterPlayerName);
      return;
    }

    const names = input
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (players.length + names.length > 10) {
      showToast(t.maxPlayers);
      return;
    }

    const newPlayers: Player[] = names.map((name) => ({
      id: Date.now() + Math.random(),
      name,
      lock: null,
    }));

    setPlayers([...players, ...newPlayers]);
    setInput("");
  }

  function removePlayer(id: number) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  function toggleLock(id: number, team: TeamLock) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, lock: p.lock === team ? null : team } : p
      )
    );
  }

  // Slot-machine animation
  function randomTeams() {
    if (players.length < 2) {
      showToast(t.needAtLeastTwo);
      return;
    }

    setRolling(true);

    let count = 0;

    const interval = setInterval(() => {
      const { teamA: newA, teamB: newB } = generateTeams(players);

      setTeamA(newA);
      setTeamB(newB);

      count++;

      if (count > 8) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 120);
  }

  function goToAgentPage() {
    if (teamA.length === 0 && teamB.length === 0) {
      showToast(t.needRandomTeams);
      return;
    }

    const allPlayers: PlayerChoice[] = [
      ...teamA.map((p) => ({ id: p.id, name: p.name, role: "Random" as const })),
      ...teamB.map((p) => ({ id: p.id, name: p.name, role: "Random" as const })),
    ];

    const assignedTeams = assignAgents(allPlayers);

    const payload = {
      teams: [teamA, teamB],
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));

    router.push(`/players?data=${encoded}`);
  }

  return (
    <main className="h-[calc(100vh-80px)] flex items-center justify-center bg-black text-white overflow-hidden">

      {toast && (
        <div className="fixed top-6 right-6 bg-red-600 px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 gap-10 w-full max-w-7xl h-[calc(100vh-140px)] mx-auto">

        {/* LEFT PANEL */}
        <div className="flex flex-col h-full min-h-0 bg-[#0f0f12] border border-white/10 rounded-2xl p-6">

          <h2 className="text-xl font-bold text-red-400 mb-2">
            {t.playersTitle}
            <span className="ml-2 text-sm text-gray-400">
              ({players.length}/10)
            </span>
          </h2>

          <p className="text-sm text-gray-400 mb-4 whitespace-pre-line">
            {t.playersHint}
          </p>

          {/* INPUT */}
          <div className="flex items-center bg-white/90 rounded-lg px-4 py-3 text-black shadow-inner mb-4">
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder={t.placeholderPlayer}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addPlayer();
              }}
            />

            <button
              onClick={addPlayer}
              className="ml-2 text-xl font-bold hover:text-red-500 transition"
            >
              +
            </button>
          </div>

          {/* PLAYER LIST */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2">

            {players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-2 rounded-lg bg-[#18181c] border transition
                ${
                  p.lock === "A"
                    ? "border-red-500"
                    : p.lock === "B"
                    ? "border-blue-500"
                    : "border-white/10 hover:border-red-400"
                }`}
              >
                <span className="font-medium tracking-wide">{p.name}</span>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => toggleLock(p.id, "A")}
                    className={`w-8 h-8 rounded text-sm font-bold transition ${
                      p.lock === "A"
                        ? "bg-red-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    A
                  </button>

                  <button
                    onClick={() => toggleLock(p.id, "B")}
                    className={`w-8 h-8 rounded text-sm font-bold transition ${
                      p.lock === "B"
                        ? "bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    B
                  </button>

                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>

                </div>
              </div>
            ))}

          </div>

          <button
            onClick={randomTeams}
            disabled={rolling}
            className={`mt-4 py-3 rounded-xl font-bold shadow-lg transition
            ${
              rolling
                ? "bg-gray-700"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:scale-105"
            }`}
          >
            {rolling ? t.rolling : t.randomTeam}
          </button>

        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col h-full min-h-0 bg-[#0f0f12] border border-white/10 rounded-2xl p-6">

          <h2 className="text-2xl font-bold text-red-400 mb-2 tracking-wide">
            {t.matchResult}
          </h2>

          <p className="text-xs text-gray-400 mb-4">
            {t.matchResultHint}
          </p>

          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">

            {/* TEAM A */}
            <div className="bg-[#141418] border border-red-500/30 rounded-xl p-4 shadow-lg flex flex-col min-h-0">

              <h3 className="text-red-400 font-bold text-lg mb-3 tracking-wide">
                Team A ({teamA.length})
              </h3>

              <div className="overflow-y-auto flex-1 space-y-2">

                {teamA.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-red-950/40 to-transparent border border-red-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-bold w-5 text-right">
                        {i + 1}
                      </span>
                      <span>{p.name}</span>
                    </div>

                    {p.lock === "A" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-400/40">
                        {t.lockLabel}
                      </span>
                    )}
                  </div>
                ))}

              </div>

            </div>

            {/* TEAM B */}
            <div className="bg-[#141418] border border-blue-500/30 rounded-xl p-4 shadow-lg flex flex-col min-h-0">

              <h3 className="text-blue-400 font-bold text-lg mb-3 tracking-wide">
                Team B ({teamB.length})
              </h3>

              <div className="overflow-y-auto flex-1 space-y-2">

                {teamB.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-blue-950/40 to-transparent border border-blue-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-bold w-5 text-right">
                        {i + 1}
                      </span>
                      <span>{p.name}</span>
                    </div>

                    {p.lock === "B" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                        {t.lockLabel}
                      </span>
                    )}
                  </div>
                ))}

              </div>

            </div>

          </div>

          <button
            onClick={goToAgentPage}
            className="mt-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:scale-105 transition py-3 rounded-xl font-bold shadow-lg"
          >
            {t.nextStep}
          </button>

        </div>

      </div>
    </main>
  );
}