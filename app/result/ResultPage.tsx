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

type AgentSpinRun = {
  nonce: number;
  startIndex: number;
  steps: number;
  duration: number;
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
  const [agentSpinRun, setAgentSpinRun] = useState<AgentSpinRun | null>(null);
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
    const storedTeamNames = localStorage.getItem("teamNames");

    if (!storedPlayers || !storedRoles) return;

    const p = JSON.parse(storedPlayers) as string[];
    const r = JSON.parse(storedRoles) as string[];
    if (storedTeamNames) {
      const names = JSON.parse(storedTeamNames) as string[];
      if (names.length) setTeamNames([names[0] || "Team A", names[1] || "Team B"]);
    }

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
    setAgentSpinRun(null);
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
      setSelectedSlot(null);
      setAgentSpinRun(null);
      return;
    }

    const currentIndex = slots.findIndex(
      (slot) => slot.teamIndex === currentSlot.teamIndex && slot.playerId === currentSlot.playerId
    );
    const ordered = currentIndex >= 0 ? [...slots.slice(currentIndex + 1), ...slots.slice(0, currentIndex + 1)] : slots;
    const nextOpen = ordered.find((slot) => !slot.player.agent);

    setSelectedSlot(nextOpen ? { teamIndex: nextOpen.teamIndex, playerId: nextOpen.playerId } : null);
    setAgentSpinRun(null);
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
    setAgentSpinRun(null);
    setAgentDrafting(false);
  }

  useEffect(() => {
    if (teams.length === 0) return;
    resetManualDraft(teams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(teams)]);

  function getAgentPool(role: Role, teamIndex: number, sourceTeams = displayTeams) {
    const allAgents = agentsData as AgentInfo[];
    const usedPlayers = uniqueAgentsInMatch ? sourceTeams.flat() : sourceTeams[teamIndex] ?? [];
    const used = new Set(usedPlayers.map((player) => player.agent).filter(Boolean));
    const pool = (role === "Random" ? allAgents : allAgents.filter((agent) => agent.role === role)).filter(
      (agent) => !used.has(agent.name)
    );

    return pool;
  }

  function pickAgentFromTeams(role: Role, teamIndex: number, sourceTeams: AssignedPlayer[][]) {
    const pool = getAgentPool(role, teamIndex, sourceTeams);

    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  function rollSelectedAgent() {
    if (!selectedSlot || agentDrafting) return;

    const targetPlayer = displayTeams[selectedSlot.teamIndex]?.find((player) => player.id === selectedSlot.playerId);
    if (!targetPlayer) return;

    clearAgentDraftTimers();

    const agentPool = getAgentPool(selectedRole, selectedSlot.teamIndex);
    if (agentPool.length === 0) return;
    const startIndex = activeAgentIndexRef.current % agentPool.length;
    const steps = 20 + Math.floor(Math.random() * 7);
    const finalIndex = (startIndex + steps) % agentPool.length;
    const finalAgent = agentPool[finalIndex];
    const duration = 2450;

    setAgentDrafting(true);
    setCurrentAgentPick({ player: { ...targetPlayer, agent: finalAgent.name, role: selectedRole }, teamIndex: selectedSlot.teamIndex });
    setActiveAgentIndex(startIndex);
    activeAgentIndexRef.current = startIndex;
    setAgentSpinRun({ nonce: Date.now(), startIndex, steps, duration });

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
      setActiveAgentIndex(finalIndex);
      activeAgentIndexRef.current = finalIndex;
      setAgentDrafting(false);
      setCurrentAgentPick(null);
      setAgentSpinRun(null);
      selectNextOpenSlot(selectedSlot, nextTeams);
    }, duration + 260);

    agentDraftTimersRef.current.push(assignTimer);
  }

  function fastRollRemaining() {
    if (agentDrafting) return;

    clearAgentDraftTimers();

    let nextTeams = displayTeams.map((team) => team.map((player) => ({ ...player })));
    const slots = getDraftSlots(nextTeams);

    slots.forEach((slot) => {
      const player = nextTeams[slot.teamIndex]?.find((item) => item.id === slot.playerId);
      if (!player || player.agent) return;

      const agent = pickAgentFromTeams((player.role as Role) || "Random", slot.teamIndex, nextTeams);
      if (!agent) return;
      player.agent = agent.name;
      player.role = (player.role as Role) || "Random";
      nextTeams = nextTeams.map((team, teamIndex) =>
        teamIndex === slot.teamIndex
          ? team.map((item) => (item.id === player.id ? { ...player } : item))
          : team
      );
    });

    setDisplayTeams(nextTeams);
    setSelectedSlot(null);
    setCurrentAgentPick(null);
    setAgentSpinRun(null);
    setAgentDrafting(false);
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
  const hasTwoTeams = teamB.length > 0;
  const draftedPlayers = displayTeams.flat();
  const draftComplete = draftedPlayers.length > 0 && draftedPlayers.every((player) => Boolean(player.agent));

  return (
    <main className="relative min-h-screen overflow-hidden bg-valorant-dark px-4 py-6 text-white sm:px-6">
      <div className="absolute inset-0 tactical-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-[1640px]">
        <header className="panel-strong cut-corners mb-5 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Valorant Random Draft</p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white">
              {hasTwoTeams ? (
                <>
                  {teamNames[0] ?? "Team A"} <span className="text-gray-500">vs</span> {teamNames[1] ?? "Team B"}
                </>
              ) : (
                teamNames[0] ?? "Team A"
              )}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {selectedMap ? `Map: ${selectedMap.name}` : draftComplete ? "Đội hình đã sẵn sàng" : "Roll a map for this lobby"}
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

        {draftComplete ? (
          <section className="cut-corners">
            <FinalMatchSummary
              teamA={teamA}
              teamB={teamB}
              teamNames={teamNames}
              map={selectedMap}
              getAgentInfoByName={getAgentInfoByName}
            />
          </section>
        ) : (
          <div className={hasTwoTeams ? "grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)_270px]" : "grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]"}>
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
                  {agentDrafting
                    ? "Đang quay agent"
                    : selectedSlot
                      ? "Chọn role rồi quay cho người đang chọn"
                      : "Chọn một người chơi"}
                </h2>
              </div>

                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <DuplicateToggle
                    checked={uniqueAgentsInMatch}
                    disabled={agentDrafting}
                    onChange={setUniqueAgentsInMatch}
                  />
                  <RolePicker
                    value={selectedRole}
                    onChange={updateSelectedRole}
                    disabled={!selectedSlot || agentDrafting}
                    disabledRoles={
                      selectedSlot
                        ? (["Duelist", "Controller", "Sentinel", "Initiator"] as Role[]).filter(
                            (role) => getAgentPool(role, selectedSlot.teamIndex).length === 0
                          )
                        : []
                    }
                  />
                </div>

                <AgentDraftCarousel
                  agents={selectedSlot ? getAgentPool(selectedRole, selectedSlot.teamIndex) : (agentsData as AgentInfo[])}
                  activeIndex={activeAgentIndex}
                  spinRun={agentSpinRun}
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
                  onFastRoll={fastRollRemaining}
                  canRoll={Boolean(selectedSlot) && !agentDrafting && (!selectedSlot || getAgentPool(selectedRole, selectedSlot.teamIndex).length > 0)}
                  canFastRoll={!agentDrafting && draftedPlayers.some((player) => !player.agent)}
                />
                {!hasTwoTeams ? <CompactMapPanel map={selectedMap} rolling={rollingMap} /> : null}
            </section>

            {hasTwoTeams ? (
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
            ) : null}
          </div>
        )}
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

            </button>
          );
        })}
      </div>
    </aside>
  );
}

function FinalMatchSummary({
  teamA,
  teamB,
  teamNames,
  map,
  getAgentInfoByName,
}: {
  teamA: AssignedPlayer[];
  teamB: AssignedPlayer[];
  teamNames: string[];
  map: MapInfo | null;
  getAgentInfoByName: (name: string) => AgentInfo | null;
}) {
  const hasTwoTeams = teamB.length > 0;

  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#07080d] p-5 lg:p-7">
      <div className="absolute inset-0 tactical-grid opacity-25" />
      <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_12%_35%,rgba(255,70,85,0.18),transparent_46%)]" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_88%_35%,rgba(74,144,255,0.16),transparent_46%)]" />

      <div className="relative z-10 space-y-6">
        <div className="grid gap-4 border border-white/10 bg-black/30 p-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-center">
          <div>
            <div className="mb-4 h-1 w-24 bg-red-500" />
            <h2 className="text-4xl font-black uppercase leading-none tracking-[0.04em] text-white sm:text-5xl">
              Match Result
            </h2>
            <p className="mt-3 text-lg font-black uppercase tracking-[0.12em] text-gray-300">
              {hasTwoTeams ? (
                <>
                  {teamNames[0] ?? "Team A"} <span className="text-gray-600">vs</span> {teamNames[1] ?? "Team B"}
                </>
              ) : (
                teamNames[0] ?? "Team A"
              )}
            </p>
          </div>

          <div className="overflow-hidden border border-yellow-300/25 bg-yellow-300/[0.04]">
            {map ? (
              <div className="relative h-[112px]">
                <Image src={map.image} alt={map.name} fill sizes="300px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
                <div className="relative z-10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200">Map</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white">{map.name}</h3>
                </div>
              </div>
            ) : (
              <div className="flex h-[112px] items-center justify-center p-4 text-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200">Map</p>
                  <p className="mt-2 text-sm font-semibold text-gray-400">Chưa roll map</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={hasTwoTeams ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] xl:items-stretch" : "grid gap-4"}>
          <FinalTeamPanel
            title={teamNames[0] ?? "Team A"}
            color="red"
            team={teamA}
            wide={!hasTwoTeams}
            getAgentInfoByName={getAgentInfoByName}
          />

          {hasTwoTeams ? (
            <>
              <div className="flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center border border-white/15 bg-black/50 text-sm font-black uppercase tracking-[0.12em] text-gray-400 shadow-2xl xl:h-full xl:w-full">
                  VS
                </div>
              </div>

              <FinalTeamPanel
                title={teamNames[1] ?? "Team B"}
                color="blue"
                team={teamB}
                getAgentInfoByName={getAgentInfoByName}
              />
            </>
          ) : null}
            </div>
      </div>
    </div>
  );
}

function FinalTeamPanel({
  title,
  color,
  team,
  wide = false,
  getAgentInfoByName,
}: {
  title: string;
  color: "red" | "blue";
  team: AssignedPlayer[];
  wide?: boolean;
  getAgentInfoByName: (name: string) => AgentInfo | null;
}) {
  const accent = color === "red" ? "border-red-400/35 bg-red-500/[0.055]" : "border-blue-400/35 bg-blue-500/[0.055]";
  const labelColor = color === "red" ? "text-red-300" : "text-blue-300";
  const lineColor = color === "red" ? "bg-red-400" : "bg-blue-400";

  return (
    <section className={`relative overflow-hidden border p-4 ${accent}`}>
      <div className="absolute inset-0 tactical-grid opacity-15" />

      <h3 className={`relative z-10 mb-4 flex items-center justify-between text-base font-black uppercase tracking-[0.14em] ${labelColor}`}>
        <span className="truncate">{title}</span>
        <span>{team.length}</span>
      </h3>
      <div className={`relative z-10 mb-4 h-px w-full ${lineColor} opacity-60`} />

      <div className={`relative z-10 grid grid-cols-5 ${wide ? "gap-3" : "gap-2"}`}>
        {team.map((player) => {
          const agent = getAgentInfoByName(player.agent);

          return (
            <div
              key={`${player.id}-${player.agent}`}
              className="relative min-w-0 overflow-hidden border border-white/10 bg-[#101119]/95 shadow-2xl cut-corners"
            >
              <div className={`relative ${wide ? "h-[360px]" : "h-[260px]"}`}>
                {agent ? (
                  <Image src={agent.image} alt={agent.name} fill sizes={wide ? "220px" : "120px"} className="object-cover object-top" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 p-3">
                  <p className={`truncate text-[10px] font-black uppercase tracking-[0.16em] ${labelColor}`}>{player.name}</p>
                  <h4 className="mt-1 truncate text-lg font-black uppercase text-white">{agent?.name ?? "No agent"}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    {agent ? <Image src={agent.icon} alt={agent.role} width={14} height={14} /> : null}
                    <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                      {agent?.role ?? "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgentDraftCarousel({
  agents,
  activeIndex,
  spinRun,
  drafting,
  currentPick,
  teamNames,
  selectedPlayerName,
  selectedRole,
  onRoll,
  onFastRoll,
  canRoll,
  canFastRoll,
}: {
  agents: AgentInfo[];
  activeIndex: number;
  spinRun: AgentSpinRun | null;
  drafting: boolean;
  currentPick: AgentDraftPick | null;
  teamNames: string[];
  selectedPlayerName?: string;
  selectedRole: Role;
  onRoll: () => void;
  onFastRoll: () => void;
  canRoll: boolean;
  canFastRoll: boolean;
}) {
  const reelRef = useRef<HTMLDivElement | null>(null);
  const safeActiveIndex = agents.length > 0 ? activeIndex % agents.length : 0;
  const cardOffsets =
    agents.length >= 5
      ? [-2, -1, 0, 1, 2]
      : agents.length === 4
        ? [-1, 0, 1, 2]
        : agents.length === 3
          ? [-1, 0, 1]
          : agents.length === 2
            ? [0, 1]
            : agents.length === 1
              ? [0]
              : [];
  const visibleCards =
    agents.length === 0
      ? []
      : cardOffsets.map((offset) => {
          const index = (safeActiveIndex + offset + agents.length) % agents.length;

          return {
            agent: agents[index],
            offset,
          };
        });
  const reelCardWidth = 178;
  const reelCards =
    spinRun && agents.length > 0
      ? Array.from({ length: spinRun.steps + 5 }, (_, position) => {
          const offset = position - 2;
          const index = (spinRun.startIndex + offset + agents.length) % agents.length;

          return {
            agent: agents[index],
            position,
          };
        })
      : [];

  useEffect(() => {
    if (!spinRun || !reelRef.current) return;

    const run = spinRun;
    const reel = reelRef.current;
    const cards = Array.from(reel.querySelectorAll<HTMLElement>("[data-reel-card]"));
    const start = performance.now();
    const baseOffset = -115 - 2 * reelCardWidth;

    function easeOutCubic(progress: number) {
      return 1 - Math.pow(1 - progress, 3);
    }

    function paint(progress: number) {
      const travelled = run.steps * reelCardWidth * easeOutCubic(progress);
      const x = baseOffset - travelled;

      reel.style.transform = `translate3d(${x}px, 0, 0)`;

      cards.forEach((card) => {
        const position = Number(card.dataset.position || 0);
        const cardCenter = x + position * reelCardWidth + 115;
        const distance = Math.min(Math.abs(cardCenter) / (reelCardWidth * 2), 1);
        const scale = 1.08 - distance * 0.28;
        const y = distance * 22;
        const opacity = 1 - distance * 0.35;
        const brightness = 1 - distance * 0.24;
        const zIndex = Math.round(100 - distance * 60);

        card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.filter = `brightness(${brightness})`;
        card.style.zIndex = `${zIndex}`;
      });
    }

    let frame = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / run.duration, 1);
      paint(progress);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    paint(0);
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [spinRun, reelCardWidth]);

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

        {spinRun ? (
          <div
            key={spinRun.nonce}
            ref={reelRef}
            className="absolute left-1/2 top-12 flex h-[320px] will-change-transform"
            style={{
              transform: `translate3d(calc(-115px - ${2 * reelCardWidth}px), 0, 0)`,
            }}
          >
            {reelCards.map(({ agent, position }) => {
              const isStartCenter = position === 2;
              const isFinalCenter = position === spinRun.steps + 2;

              return (
                <AgentReelCard
                  key={`${spinRun.nonce}-${position}-${agent.name}`}
                  agent={agent}
                  position={position}
                  className={`${isStartCenter || isFinalCenter ? "border-red-400/45" : "border-white/10"} ${
                    position < reelCards.length - 1 ? "-mr-[52px]" : ""
                  }`}
                />
              );
            })}
          </div>
        ) : (
          visibleCards.map(({ agent, offset }) => {
            const distance = Math.abs(offset);
            const x = offset * reelCardWidth;
            const y = distance === 0 ? 0 : 20;
            const scale = distance === 0 ? 1 : distance === 1 ? 0.82 : 0.68;
            const opacity = distance === 2 ? 0.2 : 1;
            const zIndex = 100 - distance * 20;
            const isCenter = distance === 0;

            return (
              <div
                key={agent.name}
                className={`absolute left-1/2 top-12 h-[320px] w-[230px] overflow-hidden border bg-[#101119]/95 shadow-2xl transition-[transform,opacity,filter] duration-200 ease-out cut-corners ${
                  isCenter ? "border-red-400/45" : "border-white/10"
                }`}
                style={{
                  opacity,
                  zIndex,
                  transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) scale(${scale})`,
                  filter: isCenter ? "brightness(1)" : "brightness(0.72)",
                  pointerEvents: "none",
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity, filter",
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
          })
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#07070a] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#07070a] to-transparent" />
      </div>

      <div className="relative z-10 mt-4 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRoll}
          disabled={!canRoll}
          className="flex h-12 items-center gap-2 bg-red-500 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-400 disabled:bg-gray-800 disabled:text-gray-500"
        >
          <Shuffle size={17} />
          Roll Agent
        </button>
        <button
          type="button"
          onClick={onFastRoll}
          disabled={!canFastRoll}
          className="flex h-12 items-center justify-center gap-2 border border-blue-400/35 bg-blue-500/10 px-6 text-sm font-black uppercase tracking-[0.08em] text-blue-200 transition hover:bg-blue-500 hover:text-white disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
        >
          <Shuffle size={17} />
          Roll nhanh
        </button>
      </div>
    </div>
  );
}

function AgentReelCard({
  agent,
  position,
  className = "",
}: {
  agent: AgentInfo;
  position: number;
  className?: string;
}) {
  return (
    <div
      data-reel-card
      data-position={position}
      className={`relative h-[320px] w-[230px] shrink-0 overflow-hidden border bg-[#101119]/95 shadow-2xl cut-corners ${className}`}
      style={{
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        willChange: "transform, opacity, filter",
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
  disabledRoles,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled: boolean;
  disabledRoles: Role[];
}) {
  const roles: Role[] = ["Random", "Duelist", "Controller", "Sentinel", "Initiator"];

  return (
    <div className="grid w-full gap-2 sm:grid-cols-5">
      {roles.map((role) => {
        const roleDisabled = disabled || disabledRoles.includes(role);

        return (
          <button
            key={role}
            type="button"
            disabled={roleDisabled}
            onClick={() => onChange(role)}
            className={`h-11 border text-xs font-black uppercase tracking-[0.08em] transition ${
              value === role
                ? "border-red-300 bg-red-500 text-white disabled:border-red-300/40 disabled:bg-red-500/30"
                : "border-white/10 bg-white/[0.035] text-gray-300 hover:border-red-400/50 hover:text-white disabled:border-white/5 disabled:bg-black/20 disabled:text-gray-700"
            }`}
            title={disabledRoles.includes(role) ? "Role này đã hết agent hợp lệ" : role}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}

function CompactMapPanel({ map, rolling }: { map: MapInfo | null; rolling: boolean }) {
  return (
    <section className="mt-5 overflow-hidden border border-yellow-300/25 bg-yellow-300/[0.04]">
      {map ? (
        <div className={`relative min-h-[150px] ${rolling ? "opacity-75" : ""}`}>
          <Image src={map.image} alt={map.name} fill sizes="900px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="relative z-10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200">Map</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.04em] text-white">{map.name}</h2>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center p-5 text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200">Map</p>
            <p className="mt-2 text-sm font-semibold text-gray-500">Chưa roll map</p>
          </div>
        </div>
      )}
    </section>
  );
}
