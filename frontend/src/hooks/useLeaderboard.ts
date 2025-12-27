import { useEffect, useState, useCallback } from "react";
import useHTTP from "./useHTTP";
import { useGame } from "./useGame";
import type { LeaderboardEntry } from "../Utils/types";
import { getDifficultyName, getDeviceType } from "../Utils/functions";

interface UseLeaderboardProps {
  limit?: number;
}

export default function useLeaderboard({ limit = 5 }: UseLeaderboardProps = {}) {
  const { http, loading } = useHTTP();
  const { boardSize, ratio, score } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const difficulty = getDifficultyName(boardSize);

  const fetchLeaderboard = useCallback(async (id?: number) => {
    const body: Record<string, string | number> = { 
      difficulty,
      top_n: limit,
      user_score: score,
    };
    if (id) body.user_id = id;
    await http({
      url: "/leaderboard",
      method: "GET",
      body,
      handleData: (data) => {
        setEntries(data as LeaderboardEntry[]);
      },
    });
  }, [http, limit, difficulty, score]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const postScore = useCallback(
    async ({ name, score }: { name: string, score: number }) => {
      const devicetype = getDeviceType();
      let id: number;

      const success = await http({
        url: "/leaderboard",
        method: "POST",
        body: { name, difficulty, ratio, score, devicetype },
        handleData: (data) => {id = (data as LeaderboardEntry).id!},
        handleSuccess: () => fetchLeaderboard(id)
      });
      return { success, id: id! };
    },
    [http, fetchLeaderboard, difficulty, ratio]
  );

  return {
    entries,
    loading,
    postScore,
    refetch: fetchLeaderboard,
  };
}
