"use client";

import {
  ArrowRight,
  ClipboardPaste,
  ListPlus,
  PanelLeftOpen,
  Shuffle,
  SkipForward,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Player, TeamLock } from "../lib/types";
import { generateTeams } from "../lib/teamRandomizer";
import { translations, useLanguage } from "../lib/i18n";

type DraftPick = {
  player: Player;
  team: "A" | "B";
};

type Speed = "slow" | "normal" | "fast";

const speedConfig: Record<Speed, { step: number; stopAfter: number; landAfter: number }> = {
  slow: { step: 520, stopAfter: 3200, landAfter: 4000 },
  normal: { step: 360, stopAfter: 2400, landAfter: 3150 },
  fast: { step: 240, stopAfter: 1600, landAfter: 2300 },
};

const splitNames = (value: string) =>
  value
    .split(/[\n,;]+/)
    .map((name) => name.trim())
    .filter(Boolean);

export default function TeamsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [inputOpen, setInputOpen] = useState(true);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [activeSpinIndex, setActiveSpinIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);

  const timersRef = useRef<number[]>([]);
  const finalTeamsRef = useRef<{ teamA: Player[]; teamB: Player[] } | null>(null);
  const activeSpinIndexRef = useRef(0);
  const assignedIds = new Set([...teamA, ...teamB].map((player) => player.id));
  const availablePlayers = players.filter((player) => !assignedIds.has(player.id));

  function clearTimers() {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    timersRef.current = [];
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    activeSpinIndexRef.current = activeSpinIndex;
  }, [activeSpinIndex]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function addPlayer() {
    const names = splitNames(input);

    if (names.length === 0) {
      showToast(t.enterPlayerName);
      return;
    }

    if (players.length + names.length > 10) {
      showToast(t.maxPlayers);
      return;
    }

    const now = Date.now();
    const newPlayers: Player[] = names.map((name, index) => ({
      id: now + index + Math.random(),
      name,
      lock: null,
    }));

    setPlayers((current) => [...current, ...newPlayers]);
    setInput("");
  }

  function removePlayer(id: number) {
    setPlayers((current) => current.filter((p) => p.id !== id));
  }

  function toggleLock(id: number, team: TeamLock) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, lock: p.lock === team ? null : team } : p
      )
    );
  }

  function getTargetTeam(player: Player, teamALength: number, teamBLength: number): "A" | "B" {
    if (player.lock === "A") return "A";
    if (player.lock === "B") return "B";
    return teamALength <= teamBLength ? "A" : "B";
  }

  function runDraft(remaining: Player[], teamALength: number, teamBLength: number) {
    if (remaining.length === 0) {
      setDrafting(false);
      return;
    }

    const timing = speedConfig[speed];

    const spinTimer = window.setInterval(() => {
      setActiveSpinIndex((index) => (index + 1) % remaining.length);
    }, timing.step);

    const stopTimer = window.setTimeout(() => {
      window.clearInterval(spinTimer);
      const pickedIndex = activeSpinIndexRef.current % remaining.length;
      setActiveSpinIndex(pickedIndex);
    }, timing.stopAfter);

    const landTimer = window.setTimeout(() => {
      const pickedIndex = activeSpinIndexRef.current % remaining.length;
      const selectedPlayer = remaining[pickedIndex];
      const targetTeam = getTargetTeam(selectedPlayer, teamALength, teamBLength);
      const pick: DraftPick = { player: selectedPlayer, team: targetTeam };
      const nextRemaining = remaining.filter((player) => player.id !== selectedPlayer.id);

      if (pick.team === "A") setTeamA((current) => [...current, pick.player]);
      else setTeamB((current) => [...current, pick.player]);

      setActiveSpinIndex(nextRemaining.length > 0 ? pickedIndex % nextRemaining.length : 0);
      runDraft(
        nextRemaining,
        teamALength + (targetTeam === "A" ? 1 : 0),
        teamBLength + (targetTeam === "B" ? 1 : 0)
      );
    }, timing.landAfter);

    timersRef.current.push(spinTimer, stopTimer, landTimer);
  }

  function randomTeams() {
    if (players.length < 2) {
      showToast(t.needAtLeastTwo);
      return;
    }

    clearTimers();

    const nextTeams = generateTeams(players);

    finalTeamsRef.current = nextTeams;
    setTeamA([]);
    setTeamB([]);
    setActiveSpinIndex(0);
    setInputOpen(false);
    setDrafting(true);

    runDraft(players, 0, 0);
  }

  function skipDraft() {
    if (!finalTeamsRef.current) return;

    clearTimers();
    setTeamA(finalTeamsRef.current.teamA);
    setTeamB(finalTeamsRef.current.teamB);
    setDrafting(false);
  }

  function goToAgentPage() {
    if (teamA.length === 0 && teamB.length === 0) {
      showToast(t.needRandomTeams);
      return;
    }

    const payload = {
      teams: [teamA, teamB],
      teamNames: [teamAName, teamBName],
    };

    router.push(`/players?data=${encodeURIComponent(JSON.stringify(payload))}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-valorant-dark px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 tactical-grid opacity-35" />

      {toast && (
        <div className="fixed right-4 top-20 z-50 border border-red-300/40 bg-red-600 px-4 py-3 text-sm font-bold shadow-2xl">
          {toast}
        </div>
      )}

      <div
        className={`relative z-10 mx-auto grid w-full max-w-[1640px] gap-5 transition-all duration-500 ${inputOpen ? "xl:grid-cols-[420px_minmax(0,1fr)]" : "xl:grid-cols-[minmax(0,1fr)]"
          }`}
      >
        {inputOpen && (
          <InputPanel
            input={input}
            setInput={setInput}
            players={players}
            teamAName={teamAName}
            teamBName={teamBName}
            setTeamAName={setTeamAName}
            setTeamBName={setTeamBName}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            toggleLock={toggleLock}
            randomTeams={randomTeams}
            drafting={drafting}
            t={t}
          />
        )}

        <section className="panel-strong cut-corners flex h-[calc(100vh-190px)] min-h-[560px] flex-col p-5">
          <div className="mb-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="valorant-title text-3xl text-white">{t.matchResult}</h1>
              <p className="mt-2 text-sm text-gray-400">

              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!inputOpen && (
                <button
                  type="button"
                  onClick={() => setInputOpen(true)}
                  className="flex h-11 items-center gap-2 border border-white/10 bg-white/[0.04] px-4 text-sm font-black uppercase tracking-[0.08em] text-gray-200 transition hover:border-red-400/50 hover:text-white"
                >
                  <PanelLeftOpen size={17} />
                  Danh sách
                </button>
              )}

              <SpeedControl speed={speed} setSpeed={setSpeed} disabled={drafting} />

              {drafting && (
                <button
                  type="button"
                  onClick={skipDraft}
                  className="flex h-11 items-center gap-2 bg-yellow-400 px-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:bg-yellow-300"
                >
                  <SkipForward size={17} />
                  Skip
                </button>
              )}

              <button
                type="button"
                onClick={randomTeams}
                disabled={drafting}
                className={`flex h-11 items-center gap-2 px-4 text-sm font-black uppercase tracking-[0.08em] transition ${drafting
                    ? "bg-gray-700 text-gray-300"
                    : "bg-red-500 text-white hover:bg-red-400"
                  }`}
              >
                <Shuffle size={17} />
                {drafting ? t.rolling : t.randomTeam}
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(220px,1fr)_minmax(420px,2fr)_minmax(220px,1fr)]">
            <TeamColumn team={teamA} color="red" title={teamAName} lockedTeam="A" lockLabel={t.lockLabel} />
            <LobbyRandomizer
              players={availablePlayers}
              activeIndex={activeSpinIndex}
              drafting={drafting}
            />
            <TeamColumn team={teamB} color="blue" title={teamBName} lockedTeam="B" lockLabel={t.lockLabel} />
          </div>

          <button
            type="button"
            onClick={goToAgentPage}
            disabled={drafting}
            className="mt-4 flex items-center justify-center gap-2 bg-blue-500 py-3 font-black uppercase tracking-[0.08em] text-white shadow-lg transition hover:bg-blue-400 disabled:bg-gray-800 disabled:text-gray-500"
          >
            {t.nextStep}
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </main>
  );
}

function InputPanel({
  input,
  setInput,
  players,
  teamAName,
  teamBName,
  setTeamAName,
  setTeamBName,
  addPlayer,
  removePlayer,
  toggleLock,
  randomTeams,
  drafting,
  t,
}: {
  input: string;
  setInput: (value: string) => void;
  players: Player[];
  teamAName: string;
  teamBName: string;
  setTeamAName: (value: string) => void;
  setTeamBName: (value: string) => void;
  addPlayer: () => void;
  removePlayer: (id: number) => void;
  toggleLock: (id: number, team: TeamLock) => void;
  randomTeams: () => void;
  drafting: boolean;
  t: typeof translations.en;
}) {
  return (
    <section className="panel cut-corners flex h-[calc(100vh-190px)] min-h-[560px] flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="valorant-title text-2xl text-white">{t.playersTitle}</h2>
          <p className="mt-2 max-w-xl whitespace-pre-line text-sm leading-5 text-gray-400">
            {t.playersHint}
          </p>
        </div>
        <span className="border border-red-400/40 bg-red-500/10 px-3 py-1 text-sm font-black text-red-200">
          {players.length}/10
        </span>
      </div>

      <div className="mb-3 border border-white/12 bg-black/45 p-3 shadow-inner">
        <textarea
          className="h-28 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-gray-500"
          placeholder={`${t.placeholderPlayer}\nJang, Quan, Ha\nhoặc mỗi người một dòng`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addPlayer();
          }}
        />

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-gray-500">
          <span>Dán nhiều tên bằng dấu phẩy hoặc xuống dòng.</span>
          <button
            type="button"
            onClick={addPlayer}
            className="flex h-9 items-center gap-2 bg-red-500 px-3 text-sm font-black text-white transition hover:bg-red-400"
          >
            <ClipboardPaste size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TeamNameInput value={teamAName} onChange={setTeamAName} color="red" />
        <TeamNameInput value={teamBName} onChange={setTeamBName} color="blue" />
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {players.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-3 border bg-[#14151d] px-4 py-3 transition ${p.lock === "A"
                ? "border-red-500"
                : p.lock === "B"
                  ? "border-blue-500"
                  : "border-white/10 hover:border-red-400/60"
              }`}
          >
            <span className="min-w-0 truncate font-semibold">{p.name}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLock(p.id, "A")}
                className={`h-8 w-8 text-sm font-black transition ${p.lock === "A" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                title={`Lock to ${teamAName}`}
              >
                A
              </button>

              <button
                type="button"
                onClick={() => toggleLock(p.id, "B")}
                className={`h-8 w-8 text-sm font-black transition ${p.lock === "B" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                title={`Lock to ${teamBName}`}
              >
                B
              </button>

              <button
                type="button"
                onClick={() => removePlayer(p.id)}
                className="flex h-8 w-8 items-center justify-center text-gray-400 transition hover:bg-red-500/15 hover:text-red-300"
                aria-label={`Remove ${p.name}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={randomTeams}
        disabled={drafting}
        className={`mt-5 flex items-center justify-center gap-2 py-3 font-black uppercase tracking-[0.08em] shadow-lg transition ${drafting
            ? "bg-gray-700 text-gray-300"
            : "bg-red-500 text-white hover:bg-red-400"
          }`}
      >
        <ListPlus size={18} />
        {drafting ? t.rolling : t.randomTeam}
      </button>
    </section>
  );
}

function SpeedControl({
  speed,
  setSpeed,
  disabled,
}: {
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-11 border border-white/10 bg-black/30 p-1">
      {(["slow", "normal", "fast"] as const).map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => setSpeed(option)}
          className={`px-3 text-xs font-black uppercase tracking-[0.08em] transition ${speed === option ? "bg-white text-black" : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function TeamNameInput({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (value: string) => void;
  color: "red" | "blue";
}) {
  const colorClass = color === "red" ? "focus:border-red-400" : "focus:border-blue-400";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-gray-500">
        Team name
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full border border-white/10 bg-black/35 px-3 py-2 text-sm font-bold text-white outline-none transition ${colorClass}`}
      />
    </label>
  );
}

function LobbyRandomizer({
  players,
  activeIndex,
  drafting,
}: {
  players: Player[];
  activeIndex: number;
  drafting: boolean;
}) {
  const safeActiveIndex = players.length > 0 ? activeIndex % players.length : 0;
  const visibleCards = players.map((player, index) => {
    let offset = index - safeActiveIndex;

    if (offset > players.length / 2) offset -= players.length;
    if (offset < -players.length / 2) offset += players.length;

    return { player, offset };
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden border border-white/10 bg-black/25 p-4">
      <div className="absolute inset-0 tactical-grid opacity-20" />

      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-gray-500">
          Lobby randomizer
        </div>

        <div className="relative mx-auto h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,70,85,0.14),transparent_62%)]" />

          {visibleCards.map((card) => {
            const distance = Math.abs(card.offset);
            const visible = distance <= 2;
            const x = card.offset * 168;
            const y = distance === 0 ? 0 : 18;
            const scale = distance === 0 ? 1 : distance === 1 ? 0.82 : 0.68;
            const opacity = visible ? (distance === 2 ? 0.18 : 1) : 0;
            const zIndex = 100 - distance * 20;
            const isCenter = distance === 0;
            const name = card.player?.name || "-";
            const cardKey = card.player?.id ?? card.offset;

            return (
              <div
                key={cardKey}
                className={`absolute left-1/2 top-16 h-[168px] w-[292px] border bg-[#101119]/95 px-5 py-5 shadow-2xl transition-[transform,opacity] duration-500 ease-out cut-corners ${isCenter ? "border-red-400/45" : "border-white/10"
                  }`}
                style={{
                  opacity,
                  zIndex,
                  transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) scale(${scale})`,
                  pointerEvents: visible ? "auto" : "none",
                }}
              >
                <div className="mb-5 h-1 w-16 bg-red-400/70" />
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">
                  {isCenter ? (drafting ? "Selecting player" : "Ready") : "Player"}
                </p>
                <div className={`${isCenter ? "mt-5 text-4xl" : "mt-4 text-2xl"} break-words font-black uppercase leading-tight tracking-[0.04em] text-white`}>
                  {name}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/75 to-transparent" />
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#07070a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#07070a] to-transparent" />
        </div>
      </div>
    </div>
  );
}

function TeamColumn({
  team,
  color,
  title,
  lockedTeam,
  lockLabel,
}: {
  team: Player[];
  color: "red" | "blue";
  title: string;
  lockedTeam: TeamLock;
  lockLabel: string;
}) {
  const accent =
    color === "red"
      ? "border-red-400/35 bg-red-500/[0.08] text-red-300"
      : "border-blue-400/35 bg-blue-500/[0.08] text-blue-300";

  return (
    <div className={`flex min-h-0 flex-col border p-4 transition-all duration-500 ${accent}`}>
      <h3 className="mb-4 flex items-center justify-between gap-3 text-lg font-black uppercase tracking-[0.08em]">
        <span className="truncate">{title || "Team"}</span>
        <span>{team.length}</span>
      </h3>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {team.map((p, i) => (
          <div
            key={p.id}
            className="animate-[teamLand_360ms_ease-out] flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 text-right font-black text-white/55">{i + 1}</span>
              <span className="truncate text-white">{p.name}</span>
            </div>

            {p.lock === lockedTeam && (
              <span className="border border-current/40 px-2 py-0.5 text-[10px] font-black uppercase">
                {lockLabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
