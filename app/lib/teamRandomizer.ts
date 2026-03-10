import { Player } from "./types";

export function shuffle(arr: Player[]) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

export function generateTeams(players: Player[]) {
  const lockedA = players.filter((p) => p.lock === "A");
  const lockedB = players.filter((p) => p.lock === "B");
  const free = players.filter((p) => p.lock === null);

  const shuffled = shuffle(free);

  const teamA: Player[] = [...lockedA];
  const teamB: Player[] = [...lockedB];

  shuffled.forEach((p) => {
    if (teamA.length <= teamB.length) teamA.push(p);
    else teamB.push(p);
  });

  return { teamA, teamB };
}