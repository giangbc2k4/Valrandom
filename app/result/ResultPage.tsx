"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  assignAgents,
  AssignedPlayer,
  Role,
  PlayerChoice,
} from "../lib/assignAgents";
import agentsData from "../data/agents.json";
import mapsData from "../data/maps.json";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ResultPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const searchParams = useSearchParams();

  const [teams, setTeams] = useState<AssignedPlayer[][]>([]);
  const [playerChoices, setPlayerChoices] = useState<PlayerChoice[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapInfo | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollingMap, setRollingMap] = useState(false);

  const rollIntervalRef = useRef<number | null>(null);
  const rollTimeoutRef = useRef<number | null>(null);
  const mapIntervalRef = useRef<number | null>(null);
  const mapTimeoutRef = useRef<number | null>(null);

  // Cleanup timers so we don't update state after unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        window.clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }
      if (rollTimeoutRef.current) {
        window.clearTimeout(rollTimeoutRef.current);
        rollTimeoutRef.current = null;
      }
      if (mapIntervalRef.current) {
        window.clearInterval(mapIntervalRef.current);
        mapIntervalRef.current = null;
      }
      if (mapTimeoutRef.current) {
        window.clearTimeout(mapTimeoutRef.current);
        mapTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const data = searchParams.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data)) as {
          teams: AssignedPlayer[][] | AssignedPlayer[];
          map?: MapInfo;
        };

        let loadedTeams: AssignedPlayer[][] = [];

        if (Array.isArray(decoded.teams[0])) {
          loadedTeams = decoded.teams as AssignedPlayer[][];
        } else {
          loadedTeams = [decoded.teams as AssignedPlayer[]];
        }

        setTeams(loadedTeams);
        setSelectedMap(decoded.map || null);
        return;
      } catch {}
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

  function reroll() {
    if (playerChoices.length === 0 || rolling) return;

    // cancel prior roll if still running
    if (rollIntervalRef.current) {
      window.clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (rollTimeoutRef.current) {
      window.clearTimeout(rollTimeoutRef.current);
      rollTimeoutRef.current = null;
    }

    setRolling(true);

    const duration = 1400;
    const interval = 100;

    rollIntervalRef.current = window.setInterval(() => {
      setTeams(assignAgents(playerChoices));
    }, interval);

    rollTimeoutRef.current = window.setTimeout(() => {
      if (rollIntervalRef.current) {
        window.clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }

      setTeams(assignAgents(playerChoices));
      setRolling(false);
      rollTimeoutRef.current = null;
    }, duration);
  }

  function rollMap() {
    if (rollingMap) return;

    // cancel prior map roll if still running
    if (mapIntervalRef.current) {
      window.clearInterval(mapIntervalRef.current);
      mapIntervalRef.current = null;
    }
    if (mapTimeoutRef.current) {
      window.clearTimeout(mapTimeoutRef.current);
      mapTimeoutRef.current = null;
    }

    setRollingMap(true);

    const duration = 1400;
    const interval = 100;

    mapIntervalRef.current = window.setInterval(() => {
      const randomMap = mapsData[Math.floor(Math.random() * mapsData.length)] as MapInfo;
      setSelectedMap(randomMap);
    }, interval);

    mapTimeoutRef.current = window.setTimeout(() => {
      if (mapIntervalRef.current) {
        window.clearInterval(mapIntervalRef.current);
        mapIntervalRef.current = null;
      }

      const finalMap = mapsData[Math.floor(Math.random() * mapsData.length)] as MapInfo;
      setSelectedMap(finalMap);
      setRollingMap(false);
      mapTimeoutRef.current = null;
    }, duration);
  }

  function getAgentInfoByName(name: string): AgentInfo | null {
    return (agentsData as AgentInfo[]).find((a) => a.name === name) || null;
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0e] via-[#111116] to-black" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.15),transparent_60%)]" />

      <div className="relative z-10 p-12">

        {/* Header */}
        <h3 className="text-4xl font-extrabold text-center text-red-500 mb-2 tracking-wider drop-shadow-[0_0_10px_rgba(255,70,85,0.6)]">
          {t.gachaResult}
        </h3>

        <p className="text-center text-gray-400 mb-10">
          {t.rerollHint}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">

          <button
            onClick={reroll}
            disabled={rolling}
            className={`px-6 py-3 rounded-xl font-bold shadow-lg transition ${
              rolling
                ? "bg-red-500 cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:scale-105"
            }`}
          >
            {rolling ? "Rolling..." : t.rerollAgents}
          </button>

          <button
            onClick={rollMap}
            disabled={rollingMap}
            className={`px-6 py-3 rounded-xl font-bold shadow-lg transition ${
              rollingMap
                ? "bg-blue-500 cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-105"
            }`}
          >
            {rollingMap ? t.rollingMap : t.rollMap}
          </button>
        </div>

        {/* Layout */}
        <div className="flex items-start justify-center gap-10 flex-wrap">

          {teams.length === 2 ? (
            <>
              <TeamDisplay
                team={teams[0]}
                color="red"
                rolling={rolling}
                getAgentInfoByName={getAgentInfoByName}
              />

              {selectedMap && <MapDisplay map={selectedMap} rolling={rollingMap} />}

              <TeamDisplay
                team={teams[1]}
                color="blue"
                rolling={rolling}
                getAgentInfoByName={getAgentInfoByName}
              />
            </>
          ) : (
            <>
              {teams[0] && (
                <TeamDisplay team={teams[0]} color="red" rolling={rolling} getAgentInfoByName={getAgentInfoByName} />
              )}

              {selectedMap && <MapDisplay map={selectedMap} rolling={rollingMap} />}
            </>
          )}
        </div>

      </div>
    </main>
  );
}

function TeamDisplay({
  team,
  color,
  rolling,
  getAgentInfoByName,
}: {
  team: AssignedPlayer[];
  color: "red" | "blue";
  rolling: boolean;
  getAgentInfoByName: (name: string) => AgentInfo | null;
}) {
  return (
    <div
      className={`flex-1 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,70,85,0.15)] ${
        color === "red"
          ? "border-2 border-red-500 bg-[#0f0f13]/90 backdrop-blur"
          : "border-2 border-blue-500 bg-[#0f0f13]/90 backdrop-blur"
      }`}
    >
      <h4
        className={`text-xl font-bold text-center mb-6 ${
          color === "red" ? "text-red-400" : "text-blue-400"
        }`}
      >
        Team {color === "red" ? "A" : "B"}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        <AnimatePresence>
          {team.map((player, i) => {
            const agentInfo = getAgentInfoByName(player.agent);
            if (!agentInfo) return null;

            return (
              <motion.div
                key={`${player.id}-${rolling ? "rolling" : "stable"}`}
                initial={{ opacity: 0, y: 40 }}
                animate={
                  rolling
                    ? {
                        opacity: [1, 0.5, 1],
                        y: [0, -30, 0],
                        scale: [1, 1.05, 1],
                      }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={{
                  duration: rolling ? 0.35 : 0.5,
                  repeat: rolling ? 3 : 0,
                  ease: "easeInOut",
                  delay: rolling ? i * 0.03 : i * 0.1,
                }}
              >
                <div className="overflow-hidden rounded-xl h-[360px] border border-white/10">

                  <div className="relative h-full flex flex-col justify-end transition hover:scale-105 hover:shadow-[0_0_30px_rgba(255,70,85,0.6)]">

                    <Image
                      src={agentInfo.image}
                      alt={agentInfo.name}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="relative p-4">

                      <h4 className="text-xl font-bold text-red-400">
                        {agentInfo.name}
                      </h4>

                      <p className="text-gray-200">{player.name}</p>

                      <div className="mt-3 flex items-center gap-2 bg-gray-900/70 px-3 py-1 rounded-md text-sm w-fit">
                        <Image
                          src={agentInfo.icon}
                          alt={agentInfo.role}
                          width={16}
                          height={16}
                        />
                        {agentInfo.role}
                      </div>

                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>
    </div>
  );
}

function MapDisplay({ map, rolling }: { map: MapInfo; rolling: boolean }) {
  return (
    <motion.div
      className="w-64 h-96 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border-2 border-yellow-400 relative"
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={
        rolling
          ? { opacity: [1, 0.7, 1], y: [0, -20, 0], scale: [1, 1.02, 1] }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: rolling ? 0.2 : 0.6, repeat: rolling ? 4 : 0, ease: "easeInOut" }}
    >
      <Image src={map.image} alt={map.name} fill className="object-cover" />

      <div className="absolute bottom-0 w-full text-center bg-black/70 text-white py-3 font-bold">
        {map.name}
      </div>
    </motion.div>
  );
}