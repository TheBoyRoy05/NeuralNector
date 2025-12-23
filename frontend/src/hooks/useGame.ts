import { create } from "zustand";

interface GameState {
  score: number;
  highScore: number;
  boardSize: number;
  difficulty: "easy" | "hard";
  setScore: (score: number) => void;
  setHighScore: (highScore: number) => void;
  setBoardSize: (boardSize: number) => void;
  setDifficulty: (difficulty: "easy" | "hard") => void;
}

export const useGame = create<GameState>((set) => {
  return {
    score: 0,
    highScore: 0,
    boardSize: 4,
    difficulty: "easy",
    setScore: (score) => set({ score }),
    setHighScore: (highScore) => set({ highScore }),
    setBoardSize: (boardSize) => set({ boardSize }),
    setDifficulty: (difficulty: "easy" | "hard") => set({ difficulty }),
  };
});