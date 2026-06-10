"use client";

import { useEffect, useRef, useState } from "react";
import { Map, RotateCcw, Shuffle } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  assignAgents,
  AssignedPlayer,
  Role,
  PlayerChoice,
} from "../lib/assignAgents";
import agentsData from "../data/agents.json";
import mapsData from "../data/maps.json";
import { translations, useLanguage } from "../lib/i18n";

type AgentInfo = {
  name: string;
  role: string;
  image: string;
  icon: string;
};

type MapInfo = {
  name: string;
  image: string;
};

type AgentDraftPick = {
  player: AssignedPlayer;
  teamIndex: number;
};

type SelectedSlot = {
  teamIndex: number;
  playerId: number;
};

type Slot = SelectedSlot & {
  player: AssignedPlayer;
};

export default function ResultPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const searchParams = useSearchParams();

  const [teams, setTeams] = useState<AssignedPlayer[][]>([]);
  const [displayTeams, setDisplayTeams] = useState<AssignedPlayer[][]>([[], []]);
  const [teamNames, setTeamNames] = useState(["Team A", "Team B"]);
  const [playerChoices, setPlayerChoices] = useState<PlayerChoice[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapInfo | null>(null);
  const [agentDrafting, setAgentDrafting] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [currentAgentPick, setCurrentAgentPick] = useState<AgentDraftPick | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("Random");
  const [uniqueAgentsInMatch, setUniqueAgentsInMatch] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [rollingMap, setRollingMap] = useState(false);

  const rollIntervalRef = useRef<number | null>(null);
  const rollTimeoutRef = useRef<number | null>(null);
  const mapIntervalRef = useRef<number | null>(null);
  const mapTimeoutRef = useRef<number | null>(null);
  const agentDraftTimersRef = useRef<number[]>([]);
  const activeAgentIndexRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
      if (rollTimeoutRef.current) window.clearTimeout(rollTimeoutRef.current);
      if (mapIntervalRef.current) window.clearInterval(mapIntervalRef.current);
      if (mapTimeoutRef.current) window.clearTimeout(mapTimeoutRef.current);
      agentDraftTimersRef.current.forEach((timer) => {
        window.clearInterval(timer);
        window.clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    activeAgentIndexRef.current = activeAgentIndex;
  }, [activeAgentIndex]);

  useEffect(() => {
    const data = searchParams.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data)) as {
          teams: AssignedPlayer[][] | AssignedPlayer[];
          teamNames?: string[];
          map?: MapInfo;
        };

        const loadedTeams = Array.isArray(decoded.teams[0])
          ? (decoded.teams as AssignedPlayer[][])
          : [decoded.teams as AssignedPlayer[]];

        setTeams(loadedTeams);
        if (decoded.teamNames?.length) setTeamNames(decoded.teamNames);
        setSelectedMap(decoded.map || null);
        return;
      } catch {
        // Fall back to local storage.
      }
    }

    const storedPlayers = localStorage.getItem("players");
    const storedRoles = localStorage.getItem("roles");

    if (!storedPlayers || !storedRoles) return;

    const p = JSON.parse(storedPlayers) as string[];
    const r = JSON.parse(storedRoles) as string[];

    const choices: PlayerChoice[] = p.map((name, idx) => ({
      id: idx,
      name: name || `Player ${idx + 1}`,
      role: (r[idx] as Role) || "Random",
    }));

    setPlayerChoices(choices);
    setTeams(assignAgents(choices));
  }, [searchParams]);

  function clearAgentDraftTimers() {
    agentDraftTimersRef.current.forEach((timer) => {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    });
    agentDraftTimersRef.current = [];
  }

  function reroll() {
    if (playerChoices.length === 0 || rolling) return;

    if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
    if (rollTimeoutRef.current) window.clearTimeout(rollTimeoutRef.current);

    setRolling(true);

    rollIntervalRef.current = window.setInterval(() => {
      setTeams(assignAgents(playerChoices));
    }, 100);

    rollTimeoutRef.current = window.setTimeout(() => {
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
      const nextTeams = assignAgents(playerChoices);
      setTeams(nextTeams);
      resetManualDraft(nextTeams);
      setRolling(false);
      rollTimeoutRef.current = null;
    }, 1400);
  }

  function rollMap() {
    if (rollingMap) return;

    if (mapIntervalRef.current) window.clearInterval(mapIntervalRef.current);
    if (mapTimeoutRef.current) window.clearTimeout(mapTimeoutRef.current);

    setRollingMap(true);

    mapIntervalRef.current = window.setInterval(() => {
      const randomMap = mapsData[Math.floor(Math.random() * mapsData.length)] as MapInfo;
      setSelectedMap(randomMap);
    }, 100);

    mapTimeoutRef.current = window.setTimeout(() => {
      if (mapIntervalRef.current) window.clearInterval(mapIntervalRef.current);
      const finalMap = mapsData[Math.floor(Math.random() * mapsData.length)] as MapInfo;
      mapIntervalRef.current = null;
      setSelectedMap(finalMap);
      setRollingMap(false);
      mapTimeoutRef.current = null;
    }, 1400);
  }

  function getAgentInfoByName(name: string): AgentInfo | null {
    return (agentsData as AgentInfo[]).find((a) => a.name === name) || null;
  }

  function getDraftSlots(nextTeams = displayTeams) {
    const slots: Slot[] = [];
    const maxSlots = Math.max(...nextTeams.map((team) => team.length), 0);

    for (let playerIndex = 0; playerIndex < maxSlots; playerIndex += 1) {
      nextTeams.forEach((team, teamIndex) => {
        const player = team[playerIndex];
        if (player) {
          slots.push({ teamIndex, playerId: player.id, player });
        }
      });
    }

    return slots;
  }

  function selectSlot(slot: SelectedSlot | null, nextTeams = displayTeams) {
    setSelectedSlot(slot);
    if (!slot) {
      setSelectedRole("Random");
      return;
    }

    const player = nextTeams[slot.teamIndex]?.find((item) => item.id === slot.playerId);
    setSelectedRole((player?.role as Role) || "Random");
  }

  function selectNextOpenSlot(currentSlot: SelectedSlot, nextTeams: AssignedPlayer[][]) {
    const slots = getDraftSlots(nextTeams);
    if (slots.length === 0) {
      selectSlot(null, nextTeams);
      return;
    }

    const currentIndex = slots.findIndex(
      (slot) => slot.teamIndex === currentSlot.teamIndex && slot.playerId === currentSlot.playerId
    );
    const ordered = currentIndex >= 0 ? [...slots.slice(currentIndex + 1), ...slots.slice(0, currentIndex + 1)] : slots;
    const nextOpen = ordered.find((slot) => !slot.player.agent);

    selectSlot(nextOpen ? { teamIndex: nextOpen.teamIndex, playerId: nextOpen.playerId } : null, nextTeams);
  }

  function resetManualDraft(nextTeams: AssignedPlayer[][]) {
    clearAgentDraftTimers();
    const resetTeams = nextTeams.map((team, teamIndex) =>
      team.map((player) => ({
        ...player,
        team: teamIndex,
        agent: "",
        role: player.role || "Random",
      }))
    );

    setDisplayTeams(resetTeams);
    const firstSlot = getDraftSlots(resetTeams)[0];
    selectSlot(firstSlot ? { teamIndex: firstSlot.teamIndex, playerId: firstSlot.playerId } : null, resetTeams);
    setCurrentAgentPick(null);
    setAgentDrafting(false);
  }

  useEffect(() => {
    if (teams.length === 0) return;
    resetManualDraft(teams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(teams)]);

  function getAgentPool(role: Role, teamIndex: number) {
    const allAgents = agentsData as AgentInfo[];
    const usedPlayers = uniqueAgentsInMatch ? displayTeams.flat() : displayTeams[teamIndex] ?? [];
    const used = new Set(usedPlayers.map((player) => player.agent).filter(Boolean));
    const pool = (role === "Random" ? allAgents : allAgents.filter((agent) => agent.role === role)).filter(
      (agent) => !used.has(agent.name)
    );
    const fallback = allAgents.filter((agent) => !used.has(agent.name));

    return pool.length > 0 ? pool : fallback.length > 0 ? fallback : allAgents;
  }

  function rollSelectedAgent() {
    if (!selectedSlot || agentDrafting) return;

    const targetPlayer = displayTeams[selectedSlot.teamIndex]?.find((player) => player.id === selectedSlot.playerId);
    if (!targetPlayer) return;

    clearAgentDraftTimers();

    const agentPool = getAgentPool(selectedRole, selectedSlot.teamIndex);
    if (agentPool.length === 0) return;
    const startIndex = activeAgentIndexRef.current % agentPool.length;
    const steps = 18 + Math.floor(Math.random() * 8);
    const finalIndex = (startIndex + steps) % agentPool.length;
    const finalAgent = agentPool[finalIndex];

    setAgentDrafting(true);
    setCurrentAgentPick({ player: { ...targetPlayer, agent: finalAgent.name, role: selectedRole }, teamIndex: selectedSlot.teamIndex });
    setActiveAgentIndex(startIndex);
    activeAgentIndexRef.current = startIndex;

    const spinTimer = window.setInterval(() => {
      setActiveAgentIndex((index) => {
        const nextIndex = (index + 1) % agentPool.length;
        activeAgentIndexRef.current = nextIndex;
        return nextIndex;
      });
    }, 115);

    const stopTimer = window.setTimeout(() => {
      window.clearInterval(spinTimer);
      setActiveAgentIndex(finalIndex);
      activeAgentIndexRef.current = finalIndex;
    }, steps * 115);

    const assignTimer = window.setTimeout(() => {
      const nextTeams = displayTeams.map((team, teamIndex) =>
          teamIndex === selectedSlot.teamIndex
            ? team.map((player) =>
                player.id === selectedSlot.playerId
                  ? { ...player, role: selectedRole, agent: finalAgent.name }
                  : player
              )
            : team
      );

      setDisplayTeams(nextTeams);
      setAgentDrafting(false);
      setCurrentAgentPick(null);
      selectNextOpenSlot(selectedSlot, nextTeams);
    }, steps * 115 + 360);

    agentDraftTimersRef.current.push(spinTimer, stopTimer, assignTimer);
  }

  function updateSelectedRole(role: Role) {
    setSelectedRole(role);
    if (!selectedSlot) return;

    setDisplayTeams((current) =>
      current.map((team, teamIndex) =>
        teamIndex === selectedSlot.teamIndex
          ? team.map((player) => (player.id === selectedSlot.playerId ? { ...player, role } : player))
          : team
      )
    );
  }

  const teamA = displayTeams[0] ?? [];
  const teamB = displayTeams.length > 1 ? displayTeams[1] : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-valorant-dark px-4 py-6 text-white sm:px-6">
      <div className="absolute inset-0 tactical-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-[1640px]">
        <header className="panel-strong cut-corners mb-5 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Valorant Random Draft</p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white">
              {teamNames[0] ?? "Team A"} <span className="text-gray-500">vs</span> {teamNames[1] ?? "Team B"}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {selectedMap ? `Map: ${selectedMap.name}` : "Roll a map for this lobby"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reroll}
              disabled={rolling || playerChoices.length === 0}
              className={`flex h-11 items-center gap-2 px-4 text-sm font-black uppercase tracking-[0.08em] transition ${
                rolling
                  ? "bg-gray-700 text-gray-300"
                  : "border border-red-400/35 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
              }`}
            >
              <RotateCcw size={17} />
              {rolling ? t.rolling : t.rerollAgents}
            </button>

            <button
              type="button"
              onClick={rollMap}
              disabled={rollingMap}
              className={`flex h-11 items-center gap-2 px-4 text-sm font-black uppercase tracking-[0.08em] transition ${
                rollingMap
                  ? "bg-gray-700 text-gray-300"
                  : "border border-blue-400/35 bg-blue-500/10 text-blue-200 hover:bg-blue-500 hover:text-white"
              }`}
            >
              <Map size={17} />
              {rollingMap ? t.rollingMap : t.rollMap}
            </button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)_270px]">
          <SideRoster
            title={teamNames[0] ?? "Team A"}
            side="A"
            color="red"
            team={teamA}
            rolling={rolling}
            selectedSlot={selectedSlot}
            onSelect={(playerId) => {
              if (agentDrafting) return;
              selectSlot({ teamIndex: 0, playerId });
            }}
            getAgentInfoByName={getAgentInfoByName}
          />

          <section className="panel cut-corners min-h-[680px] p-5">
            <div className="mb-5 border border-white/10 bg-black/30 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">Draft Status</p>
              <h2 className="mt-2 text-lg font-black uppercase tracking-[0.08em] text-white">
                {agentDrafting ? "Đang quay agent" : selectedSlot ? "Chọn role rồi quay cho người đang chọn" : "Chọn một người chơi"}
              </h2>
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <DuplicateToggle
                checked={uniqueAgentsInMatch}
                disabled={agentDrafting}
                onChange={setUniqueAgentsInMatch}
              />
              <RolePicker value={selectedRole} onChange={updateSelectedRole} disabled={!selectedSlot || agentDrafting} />
            </div>

            <AgentDraftCarousel
              agents={selectedSlot ? getAgentPool(selectedRole, selectedSlot.teamIndex) : (agentsData as AgentInfo[])}
              activeIndex={activeAgentIndex}
              drafting={agentDrafting}
              currentPick={currentAgentPick}
              teamNames={teamNames}
              selectedPlayerName={
                selectedSlot
                  ? displayTeams[selectedSlot.teamIndex]?.find((player) => player.id === selectedSlot.playerId)?.name
                  : undefined
              }
              selectedRole={selectedRole}
              onRoll={rollSelectedAgent}
              canRoll={Boolean(selectedSlot) && !agentDrafting}
            />
          </section>

          {teams.length > 1 ? (
            <SideRoster
              title={teamNames[1] ?? "Team B"}
              side="B"
              color="blue"
              team={teamB}
              rolling={rolling}
              selectedSlot={selectedSlot}
              onSelect={(playerId) => {
                if (agentDrafting) return;
                selectSlot({ teamIndex: 1, playerId });
              }}
              getAgentInfoByName={getAgentInfoByName}
            />
          ) : (
            <MapPanel map={selectedMap} rolling={rollingMap} />
          )}
        </div>
      </div>
    </main>
  );
}

function SideRoster({
  title,
  side,
  color,
  team,
  rolling,
  selectedSlot,
  onSelect,
  getAgentInfoByName,
}: {
  title: string;
  side: "A" | "B";
  color: "red" | "blue";
  team: AssignedPlayer[];
  rolling: boolean;
  selectedSlot: SelectedSlot | null;
  onSelect: (playerId: number) => void;
  getAgentInfoByName: (name: string) => AgentInfo | null;
}) {
  const accent =
    color === "red"
      ? "border-red-400/35 bg-red-500/[0.06] text-red-300"
      : "border-blue-400/35 bg-blue-500/[0.06] text-blue-300";

  return (
    <aside className={`panel cut-corners min-h-[680px] p-4 ${accent}`}>
      <h2 className="mb-5 flex items-center justify-between text-sm font-black uppercase tracking-[0.12em]">
        <span className="truncate">{title}</span>
        <span>{team.length}</span>
      </h2>

      <div className="space-y-3">
        {team.map((player, index) => {
          const agent = getAgentInfoByName(player.agent);
          const selected = selectedSlot?.teamIndex === (side === "A" ? 0 : 1) && selectedSlot.playerId === player.id;

          return (
            <button
              type="button"
              key={`${player.id}-${player.agent}`}
              onClick={() => onSelect(player.id)}
              className={`flex w-full items-center gap-3 border bg-black/35 p-3 text-left transition ${
                rolling ? "opacity-60" : "opacity-100"
              } ${
                selected
                  ? color === "red"
                    ? "border-red-300 bg-red-500/15"
                    : "border-blue-300 bg-blue-500/15"
                  : color === "red"
                    ? "border-red-400/20 hover:border-red-300/60"
                    : "border-blue-400/20 hover:border-blue-300/60"
              }`}
            >
              <span className="w-6 text-right text-xs font-black text-white/45">
                #{index + 1}
              </span>

              <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-white/10 bg-white/[0.04]">
                {agent ? (
                  <Image src={agent.image} alt={agent.name} fill sizes="48px" className="object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-gray-500">
                    wait
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {agent ? <Image src={agent.icon} alt={agent.role} width={14} height={14} /> : null}
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                    {agent?.role ?? player.role ?? "Random"}
                  </p>
                </div>
                <p className="truncate text-sm font-black uppercase text-white">{player.name}</p>
                <p className="truncate text-xs text-gray-400">{agent ? agent.name : "Chưa chọn agent"}</p>
              </div>

              <span className={`border px-2 py-1 text-[10px] font-black ${color === "red" ? "border-red-400/35" : "border-blue-400/35"}`}>
                {side}{index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function AgentDraftCarousel({
  agents,
  activeIndex,
  drafting,
  currentPick,
  teamNames,
  selectedPlayerName,
  selectedRole,
  onRoll,
  canRoll,
}: {
  agents: AgentInfo[];
  activeIndex: number;
  drafting: boolean;
  currentPick: AgentDraftPick | null;
  teamNames: string[];
  selectedPlayerName?: string;
  selectedRole: Role;
  onRoll: () => void;
  canRoll: boolean;
}) {
  const safeActiveIndex = agents.length > 0 ? activeIndex % agents.length : 0;
  const visibleCards = agents.map((agent, index) => {
    let offset = index - safeActiveIndex;

    if (offset > agents.length / 2) offset -= agents.length;
    if (offset < -agents.length / 2) offset += agents.length;

    return { agent, offset };
  });

  return (
    <div className="relative min-h-[500px] overflow-hidden border border-white/10 bg-black/25 p-5">
      <div className="absolute inset-0 tactical-grid opacity-20" />
      <div className="relative z-10 mb-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">
          {currentPick
            ? `${currentPick.player.name} -> ${teamNames[currentPick.teamIndex] ?? "Team"}`
            : drafting
              ? "Rolling agent carousel"
              : selectedPlayerName
                ? `${selectedPlayerName} chọn ${selectedRole}`
                : "Chọn một người chơi ở roster"}
        </p>
      </div>

      <div className="relative mx-auto h-[410px] max-w-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,70,85,0.16),transparent_62%)]" />

        {visibleCards.map(({ agent, offset }) => {
          const distance = Math.abs(offset);
          const visible = distance <= 2;
          const x = offset * 178;
          const y = distance === 0 ? 0 : 18;
          const scale = distance === 0 ? 1 : distance === 1 ? 0.82 : 0.68;
          const opacity = visible ? (distance === 2 ? 0.18 : 1) : 0;
          const zIndex = 100 - distance * 20;
          const isCenter = distance === 0;

          return (
            <div
              key={agent.name}
              className={`absolute left-1/2 top-12 h-[320px] w-[230px] overflow-hidden border bg-[#101119]/95 shadow-2xl transition-[transform,opacity] duration-500 ease-out cut-corners ${
                isCenter ? "border-red-400/45" : "border-white/10"
              }`}
              style={{
                opacity,
                zIndex,
                transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) scale(${scale})`,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <Image src={agent.image} alt={agent.name} fill sizes="230px" className="object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/65 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
                  <Image src={agent.icon} alt={agent.role} width={15} height={15} />
                  {agent.role}
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase text-white">{agent.name}</h3>
              </div>
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#07070a] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#07070a] to-transparent" />
        <div className={`absolute bottom-5 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border border-red-400/30 bg-black/70 shadow-[0_0_34px_rgba(255,70,85,0.22)] ${drafting ? "animate-pulse" : ""}`}>
          <div className={`absolute inset-3 rounded-full border border-dashed border-red-300/30 ${drafting ? "animate-spin" : ""}`} />
          <Shuffle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-300" size={24} />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex justify-center">
        <button
          type="button"
          onClick={onRoll}
          disabled={!canRoll}
          className="flex h-12 items-center gap-2 bg-red-500 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-400 disabled:bg-gray-800 disabled:text-gray-500"
        >
          <Shuffle size={17} />
          Roll Agent
        </button>
      </div>
    </div>
  );
}

function DuplicateToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.035] px-4 text-xs font-black uppercase tracking-[0.08em] text-gray-300 transition hover:border-red-400/40">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-red-500"
      />
      <span>{checked ? "Không trùng agent" : "Cho phép trùng agent"}</span>
    </label>
  );
}

function RolePicker({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled: boolean;
}) {
  const roles: Role[] = ["Random", "Duelist", "Controller", "Sentinel", "Initiator"];

  return (
    <div className="grid w-full gap-2 sm:grid-cols-5">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          disabled={disabled}
          onClick={() => onChange(role)}
          className={`h-11 border text-xs font-black uppercase tracking-[0.08em] transition ${
            value === role
              ? "border-red-300 bg-red-500 text-white"
              : "border-white/10 bg-white/[0.035] text-gray-300 hover:border-red-400/50 hover:text-white disabled:text-gray-600"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}

function MapPanel({ map, rolling }: { map: MapInfo | null; rolling: boolean }) {
  return (
    <aside className="panel cut-corners min-h-[680px] overflow-hidden border-yellow-300/25">
      {map ? (
        <div className={`relative h-full min-h-[680px] ${rolling ? "opacity-75" : ""}`}>
          <Image src={map.image} alt={map.name} fill sizes="270px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 border-t border-yellow-200/25 bg-black/65 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200">Map</p>
            <h2 className="mt-1 text-3xl font-black uppercase text-white">{map.name}</h2>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[680px] items-center justify-center p-6 text-center text-sm text-gray-500">
          Roll Map
        </div>
      )}
    </aside>
  );
}
