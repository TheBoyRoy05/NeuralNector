import { create } from "zustand";

import type { ImageProps } from "../components/Game/Images";

interface GameState {
  score: number;
  timeBonus: number;
  highScores: Record<number, number>; // boardSize -> highScore
  boardSize: number;
  ratio: string;
  ratioType: "equal" | "random";
  isGameStarted: boolean;
  isReviewing: boolean;
  showCompletionModal: boolean;
  elapsedTime: number;
  reviewResults: Record<string, "correct" | "incorrect" | null>;
  currentReviewIndex: number;
  imageRefreshKey: number; // Increments to trigger image refetch
  images: ImageProps[];
  numSelected: number;
  setImages: (images: ImageProps[]) => void;
  setScore: (score: number) => void;
  setTimeBonus: (timeBonus: number) => void;
  setHighScore: (boardSize: number, score: number) => void;
  setBoardSize: (boardSize: number) => void;
  setRatioType: (ratioType: "equal" | "random") => void;
  setElapsedTime: (time: number) => void;
  setReviewResults: (results: Record<string, "correct" | "incorrect" | null>) => void;
  setCurrentReviewIndex: (index: number) => void;
  setShowCompletionModal: (show: boolean) => void;
  setNumSelected: (num: number) => void;
  startGame: () => void;
  resetGame: () => void;
  startReview: () => void;
  setRatio: (ratio: string) => void;
}

export const useGame = create<GameState>((set, get) => {
  return {
    score: 0,
    timeBonus: 0,
    highScores: {},
    boardSize: 4,
    ratio: "8:8",
    ratioType: "equal",
    isGameStarted: false,
    isReviewing: false,
    showCompletionModal: false,
    elapsedTime: 0,
    reviewResults: {},
    currentReviewIndex: 0,
    imageRefreshKey: 0,
    images: [],
    numSelected: 0,
    setImages: (images) => set({ images }),
    setNumSelected: (num) => set({ numSelected: num }),
    setScore: (score) => set({ score }),
    setTimeBonus: (timeBonus) => set({ timeBonus }),
    setHighScore: (boardSize, score) => {
      const currentHigh = get().highScores[boardSize] || 0;
      if (score > currentHigh) {
        set({ highScores: { ...get().highScores, [boardSize]: score } });
      }
    },
    setBoardSize: (boardSize) => set({ boardSize }),
    setRatioType: (ratioType: "equal" | "random") => set({ ratioType }),
    setElapsedTime: (time) => set({ elapsedTime: time }),
    setReviewResults: (results) => set({ reviewResults: results }),
    setCurrentReviewIndex: (index) => set({ currentReviewIndex: index }),
    setShowCompletionModal: (show) => set({ showCompletionModal: show }),
    startGame: () => set({ isGameStarted: true, elapsedTime: 0, isReviewing: false, reviewResults: {}, currentReviewIndex: 0, showCompletionModal: false, timeBonus: 0, numSelected: 0 }),
    resetGame: () => set({ 
      isGameStarted: false, 
      score: 0, 
      timeBonus: 0,
      elapsedTime: 0, 
      isReviewing: false, 
      reviewResults: {}, 
      currentReviewIndex: 0, 
      showCompletionModal: false,
      numSelected: 0,
      imageRefreshKey: get().imageRefreshKey + 1 // Increment to trigger refetch
    }),
    startReview: () => set({ isReviewing: true, currentReviewIndex: 0 }),
    setRatio: (ratio) => set({ ratio }),
  };
});