// app/lib/assignAgents.ts
import agentsData from "../data/agents.json";

export type Role = "Duelist" | "Initiator" | "Controller" | "Sentinel" | "Random";

export interface PlayerChoice {
  id: number;
  name: string;
  role: Role;
}

export interface AssignedPlayer extends PlayerChoice {
  agent: string;
  team: number; // 0 hoặc 1
}

type AgentData = {
  name: string;
  role: string;
  icon?: string;
  image?: string;
};

const ALL_AGENTS = (agentsData as unknown) as AgentData[];

/**
 * assignAgents
 * - players: PlayerChoice[] (length <=5 => 1 team, length >5 => 2 teams split 5/5)
 * - returns AssignedPlayer[][] (team arrays)
 *
 * Rules:
 * - If ANY player in the whole set chose "Random", we enforce: each team must have at least 1 Controller (smoke).
 * - If NO player chose "Random" (everyone picked specific role), we DO NOT force adding a controller.
 * - Within the same team agents never duplicate. Different teams may have the same agent.
 */
export function assignAgents(players: PlayerChoice[]): AssignedPlayer[][] {
  if (!Array.isArray(players) || players.length === 0) return [];

  // build map role -> agent name list
  const agentsByRole: Record<Role, string[]> = {
    Duelist: ALL_AGENTS.filter((a) => a.role === "Duelist").map((a) => a.name),
    Initiator: ALL_AGENTS.filter((a) => a.role === "Initiator").map((a) => a.name),
    Controller: ALL_AGENTS.filter((a) => a.role === "Controller").map((a) => a.name),
    Sentinel: ALL_AGENTS.filter((a) => a.role === "Sentinel").map((a) => a.name),
    Random: ALL_AGENTS.map((a) => a.name),
  };

  // Prepare teams
  const teams: AssignedPlayer[][] = [];
  if (players.length <= 5) {
    teams.push(players.map((p) => ({ ...p, agent: "", team: 0 })));
  } else {
    teams.push([]);
    teams.push([]);
    players.forEach((p, idx) => {
      const teamIndex = idx < 5 ? 0 : 1; // first 5 -> team 0, next 5 -> team 1
      teams[teamIndex].push({ ...p, agent: "", team: teamIndex });
    });
  }

  // Track used agents per team (to avoid duplicates in same team)
  const usedAgents = teams.map(() => new Set<string>());

  function getRandomItem<T>(arr: T[]): T | null {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickAgentForRole(role: Role, teamIndex: number): string {
    const pool = agentsByRole[role] ?? agentsByRole.Random;
    // only those not used in this team
    const available = pool.filter((name) => !usedAgents[teamIndex].has(name));
    let chosen = getRandomItem(available);
    if (!chosen) {
      // fallback: pick any in role (even if used) but prefer unused from full pool
      const fallbackAvailable = agentsByRole.Random.filter((n) => !usedAgents[teamIndex].has(n));
      chosen = getRandomItem(fallbackAvailable) || getRandomItem(pool);
    }
    // if still null (very unlikely), pick any from ALL_AGENTS
    if (!chosen) {
      chosen = getRandomItem(ALL_AGENTS.map((a) => a.name))!;
    }
    usedAgents[teamIndex].add(chosen);
    return chosen;
  }

  // Determine if we should enforce smoke: if any player in the entire input is Random
  const enforceSmoke = players.some((p) => p.role === "Random");

  // For each team: assign agents
  for (let t = 0; t < teams.length; t++) {
    const team = teams[t];

    // 1) If some players explicitly chose Controller, assign them first
    for (let i = 0; i < team.length; i++) {
      if (team[i].role === "Controller") {
        team[i].agent = pickAgentForRole("Controller", t);
      }
    }

    // 2) Assign other explicit roles (Duelist / Initiator / Sentinel)
    for (let i = 0; i < team.length; i++) {
      if (team[i].agent) continue;
      const r = team[i].role;
      if (r !== "Random") {
        team[i].agent = pickAgentForRole(r, t);
      }
    }

    // 3) Assign Random slots
    for (let i = 0; i < team.length; i++) {
      if (team[i].agent) continue;
      team[i].agent = pickAgentForRole("Random", t);
    }

    // 4) Enforce at least one Controller only if enforceSmoke === true
    if (enforceSmoke) {
      const hasController = team.some((p) => {
        // check assigned agent's role
        const name = p.agent;
        const ag = ALL_AGENTS.find((a) => a.name === name);
        return ag?.role === "Controller";
      });
      if (!hasController) {
        // try to find an unused controller in this team's remaining pool
        const availableControllers = agentsByRole.Controller.filter((n) => !usedAgents[t].has(n));
        if (availableControllers.length > 0) {
          const controllerPick = getRandomItem(availableControllers)!;
          // prefer to replace a player who had role Random; otherwise replace random slot
          const randomIdxs = team
            .map((p, idx) => ({ p, idx }))
            .filter((x) => x.p.role === "Random")
            .map((x) => x.idx);
          const candidateIdxs = randomIdxs.length > 0
            ? randomIdxs
            : team.map((_, idx) => idx);
          const replaceIdx = candidateIdxs[Math.floor(Math.random() * candidateIdxs.length)];
          // remove from usedAgents (if controllerPick was in usedAgents mistakenly) and add
          usedAgents[t].add(controllerPick);
          team[replaceIdx].agent = controllerPick;
        } else {
          // last resort: pick any controller (even if used elsewhere)
          const fallback = ALL_AGENTS.find((a) => a.role === "Controller" && !team.some(p => p.agent === a.name));
          if (fallback) {
            team[Math.floor(Math.random() * team.length)].agent = fallback.name;
          }
        }
      }
    }
  }

  return teams;
}
