export interface LeaderboardEntry {
  id?: number;
  name?: string; // null indicates the user's row
  score?: number;
  rank?: number; // null indicates a separator row
}

export interface PostScoreParams {
  name: string;
  score: number;
  difficulty: string;
  ratio: string;
  devicetype: string;
}

export type ReviewResults = Record<string, "correct" | "incorrect" | null>;
