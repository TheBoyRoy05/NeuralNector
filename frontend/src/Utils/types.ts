export interface LeaderboardEntry {
  name?: string; // undefined indicates the user's row
  score?: number;
  rank?: number; // undefined indicates a separator row
}

export interface PostScoreParams {
  name: string;
  score: number;
  difficulty: string;
  ratio: string;
  devicetype: string;
}