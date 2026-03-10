export type TeamLock = "A" | "B" | null;

export interface Player {
  id: number;
  name: string;
  lock: TeamLock;
}