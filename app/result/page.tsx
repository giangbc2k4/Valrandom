"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  assignAgents,
  AssignedPlayer,
  Role,
  PlayerChoice,
} from "../lib/assignAgents";
import agentsData from "../data/agents.json";
import mapsData from "../data/maps.json";
import { motion, AnimatePresence } from "framer-motion";

// 🔗 Share link
function getShareLink(teams: AssignedPlayer[][], map?: any) {
  if (typeof window === "undefined") return "";
  const payload = { teams, map };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `${window.location.origin}/result?data=${encoded}`;
}

function ShareButton({
  teams,
  map,
}: {
  teams: AssignedPlayer[][];
  map?: any;
}) {
  function copyShareLink() {
    const url = getShareLink(teams, map);
    navigator.clipboard.writeText(url);
    alert("✅ Share link copied!");
  }

  return (
    <button
      onClick={copyShareLink}
      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white shadow-lg transition"
    >
      🔗 Share Result
    </button>
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState<AssignedPlayer[][]>([]);
  const [playerChoices, setPlayerChoices] = useState<PlayerChoice[]>([]);
  const [selectedMap, setSelectedMap] = useState<any>(null);

  // --- Load data from share link or localStorage
  useEffect(() => {
    const data = searchParams.get("data");

    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));

        // Chuẩn hóa luôn thành 2D array
        let loadedTeams: AssignedPlayer[][] = [];
        if (decoded.teams) {
          loadedTeams = Array.isArray(decoded.teams[0])
            ? decoded.teams
            : [decoded.teams];
        }

        setTeams(loadedTeams);
        setSelectedMap(decoded.map || null);
        return;
      } catch (err) {
        console.error("Invalid shared data:", err);
      }
    }

    const storedPlayers = localStorage.getItem("players");
    const storedRoles = localStorage.getItem("roles");

    if (!storedPlayers || !storedRoles) return;

    try {
      const p = JSON.parse(storedPlayers) as string[];
      const r = JSON.parse(storedRoles) as string[];

      const choices: PlayerChoice[] = p.map((name, idx) => ({
        id: idx,
        name: name || `Player ${idx + 1}`,
        role: (r[idx] as Role) || "Random",
      }));

      setPlayerChoices(choices);
      setTeams(assignAgents(choices));
    } catch (err) {
      console.error("Error parsing localStorage data:", err);
    }
  }, []);

  function reroll() {
    if (playerChoices.length === 0) return;
    setTeams(assignAgents(playerChoices));
  }

  function rollMap() {
    const map = mapsData[Math.floor(Math.random() * mapsData.length)];
    setSelectedMap(map);
  }

  function getAgentInfoByName(name: string) {
    return (agentsData as any[]).find((a) => a.name === name) || null;
  }

  return (
    <main className="p-12 bg-valorant-dark min-h-screen text-white">
      <h3 className="text-3xl font-bold text-center text-red-500 mb-8">
        GACHA RESULT
      </h3>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mb-10 flex-wrap">
        <button
          onClick={reroll}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg transition"
        >
          🔄 Reroll Agents
        </button>

        <button
          onClick={rollMap}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white shadow-lg transition"
        >
          🎲 Roll Map
        </button>

        {teams.length > 0 && (
          <ShareButton teams={teams} map={selectedMap} />
        )}
      </div>

      {/* Teams + Map */}
      <div
        className={`flex items-center justify-center gap-6 flex-wrap`}
      >
        {teams.length === 2 ? (
          <>
            <TeamDisplay
              team={teams[0]}
              color="red"
              getAgentInfoByName={getAgentInfoByName}
            />
            {selectedMap && <MapDisplay map={selectedMap} />}
            <TeamDisplay
              team={teams[1]}
              color="blue"
              getAgentInfoByName={getAgentInfoByName}
            />
          </>
        ) : (
          <>
            {teams[0] && (
              <TeamDisplay
                team={teams[0]}
                color="red"
                getAgentInfoByName={getAgentInfoByName}
              />
            )}
            {selectedMap && <MapDisplay map={selectedMap} />}
          </>
        )}
      </div>
    </main>
  );
}

// ---------- Team Display ----------
function TeamDisplay({
  team,
  color,
  getAgentInfoByName,
}: {
  team: AssignedPlayer[];
  color: "red" | "blue";
  getAgentInfoByName: (name: string) => any;
}) {
  return (
    <div
      className={`flex-1 rounded-2xl p-6 shadow-lg ${
        color === "red"
          ? "border-2 border-red-500 bg-black/40"
          : "border-2 border-blue-500 bg-black/40"
      }`}
    >
      {team.length > 0 && (
        <h4
          className={`text-xl font-bold text-center mb-6 ${
            color === "red" ? "text-red-400" : "text-blue-400"
          }`}
        >
          Team {color === "red" ? "A" : "B"}
        </h4>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AnimatePresence>
          {team.map((player, i) => {
            const agentInfo = getAgentInfoByName(player.agent);
            if (!agentInfo) return null;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="overflow-hidden rounded-xl h-[380px]">
                  <div
                    className="relative rounded-xl h-full flex flex-col justify-end transform transition hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundImage: `url("${agentInfo.image}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="relative p-4 z-10">
                      <h4 className="text-xl font-bold text-red-400 drop-shadow-lg">
                        {agentInfo.name}
                      </h4>
                      <p className="text-gray-200 drop-shadow">{player.name}</p>
                      <div className="mt-3 flex items-center gap-2 bg-gray-900/70 px-3 py-1 rounded-md text-sm w-fit">
                        <img
                          src={agentInfo.icon}
                          alt={agentInfo.role}
                          className="w-4 h-4"
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

// ---------- Map Display ----------
function MapDisplay({ map }: { map: any }) {
  return (
    <motion.div
      className="w-60 h-80 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border-2 border-yellow-400 relative"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={map.image}
        alt={map.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 w-full text-center bg-black/60 text-white py-2 font-bold">
        {map.name}
      </div>
    </motion.div>
  );
}
