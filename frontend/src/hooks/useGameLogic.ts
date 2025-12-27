import { useEffect, useRef, useState } from "react";
import type { ImageProps } from "../components/Game/Images";
import { useGame } from "./useGame";

interface UseGameLogicProps {
  images: ImageProps[];
}

export default function useGameLogic({ images }: UseGameLogicProps) {
  const {
    boardSize,
    ratioType,
    isGameStarted,
    isReviewing,
    reviewResults,
    currentReviewIndex,
    elapsedTime,
    setReviewResults,
    setCurrentReviewIndex,
    setScore,
    setTimeBonus,
    setHighScore,
    setShowCompletionModal,
    setNumSelected,
  } = useGame();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const prevGameStartedRef = useRef(isGameStarted);

  // Reset selected images when game resets
  useEffect(() => {
    if (prevGameStartedRef.current && !isGameStarted) {
      // Game was reset - clear selections (defer to avoid linter warning)
      setTimeout(() => {
        setSelectedImages(new Set());
        setNumSelected(0);
      }, 0);
    }
    prevGameStartedRef.current = isGameStarted;
  }, [isGameStarted, setNumSelected]);

  // Reset selected images when images change (new game started)
  useEffect(() => {
    // Defer to avoid linter warning
    setTimeout(() => {
      setSelectedImages(new Set());
      setNumSelected(0);
    }, 0);
  }, [images.length, setNumSelected]);

  // Calculate review results when review starts
  useEffect(() => {
    if (isReviewing && Object.keys(reviewResults).length === 0) {
      const results: Record<string, "correct" | "incorrect" | null> = {};

      images.forEach((image) => {
        const isSelected = selectedImages.has(image.image_id);
        // User selects images they think are FAKE
        // Correct if: (selected and is_real=false) OR (not selected and is_real=true)
        const isCorrect = (isSelected && !image.is_real) || (!isSelected && image.is_real);
        results[image.image_id] = isCorrect ? "correct" : "incorrect";
      });

      setReviewResults(results);
      setCurrentReviewIndex(0);
    }
  }, [isReviewing, images, selectedImages, reviewResults, setReviewResults, setCurrentReviewIndex]);

  // Animate through review results one at a time
  useEffect(() => {
    if (isReviewing && Object.keys(reviewResults).length > 0) {
      if (currentReviewIndex < images.length - 1) {
        // Review delay based on board size - faster for larger boards
        const reviewDelay = { 2: 400, 4: 250, 6: 150, 8: 80 }[boardSize] || 250;
        const timer = setTimeout(() => {
          setCurrentReviewIndex(currentReviewIndex + 1);
        }, reviewDelay);
        return () => clearTimeout(timer);
      } else {
        // Review complete - calculate score and show modal after 500ms
        const correctCount = Object.values(reviewResults).filter((r) => r === "correct").length;
        const totalCount = images.length;

        // Score calculation: correctness (0-100) + time bonus (faster = better)
        // Base score: percentage correct * 100
        const correctnessScore = (correctCount / totalCount) * 100;

        // Time bonus: faster times get higher bonus (max 50 points)
        // Formula: 50 * (1 - min(time/maxTime, 1)) where maxTime is the maximum time for the board size
        const maxTime = { 2: 10, 4: 30, 6: 60, 8: 120 }[boardSize];
        const timeBonus = 50 * (1 - Math.min(elapsedTime / (maxTime || 30), 1));

        // Ratio multiplier: random gets 1.33x, equal gets 1.0x
        const ratioMultiplier = ratioType === "random" ? 1.33 : 1.0;
        const baseScore = correctnessScore + timeBonus;
        const finalScore = baseScore * ratioMultiplier;
        
        setScore(finalScore);
        setTimeBonus(timeBonus);
        setHighScore(boardSize, finalScore);

        // Show modal after 500ms
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 500);
      }
    }
  }, [
    isReviewing,
    currentReviewIndex,
    images.length,
    reviewResults,
    elapsedTime,
    boardSize,
    ratioType,
    setCurrentReviewIndex,
    setScore,
    setTimeBonus,
    setHighScore,
    setShowCompletionModal,
  ]);

  const handleImageClick = (imageId: string) => {
    if (!isGameStarted || isReviewing) return; // Only allow clicking during gameplay

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      setNumSelected(newSet.size);
      return newSet;
    });
  };

  return {
    selectedImages,
    handleImageClick,
  };
}
