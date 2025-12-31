import type { ImageProps } from "../components/Game/Images";
import type { ReviewResults } from "./types";

export const scrollTo = (id: string, offset: number = 0) => {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
  }
};

export const getDifficultyName = (boardSize: number): string => {
  if (boardSize === 2) return "Easy";
  if (boardSize === 4) return "Normal";
  if (boardSize === 6) return "Hard";
  if (boardSize === 8) return "Impossible";
  return "Normal";
};

export const getDeviceType = (): string => {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 600) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

export const calculateF1Score = (images: ImageProps[], reviewResults: ReviewResults) => {
  // Calculate F1 score: TP / (TP + 0.5 * (FP + FN))
  // TP (True Positives): result="correct" AND is_real=false (correctly identified fake)
  // FP (False Positives): result="incorrect" AND is_real=true (incorrectly selected real as fake)
  // FN (False Negatives): result="incorrect" AND is_real=false (missed a fake)

  let TP = 0; // correctly identified fakes
  let FP = 0; // incorrectly selected reals as fakes
  let FN = 0; // missed fakes

  images.forEach((image) => {
    const result = reviewResults[image.image_id];
    if (result === "correct" && !image.is_real) {
      TP++; // Correctly identified fake
    } else if (result === "incorrect" && image.is_real) {
      FP++; // Incorrectly selected real as fake
    } else if (result === "incorrect" && !image.is_real) {
      FN++; // Missed a fake
    }
  });

  const denominator = TP + 0.5 * (FP + FN);
  const f1Score = denominator > 0 ? TP / denominator : 1;

  return { TP, FP, FN, f1Score };
};
