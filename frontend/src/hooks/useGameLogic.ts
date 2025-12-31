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
        // Calculate proportion of fakes that were classified properly
        const fakeImages = images.filter((img) => !img.is_real);
        const correctlyClassifiedFakes = fakeImages.filter(
          (img) => reviewResults[img.image_id] === "correct"
        ).length;

        // Score calculation: correctness (0-50) + time bonus (0-50)
        const maxScore = 100;
        const correctnessScore =
          fakeImages.length > 0
            ? ((correctlyClassifiedFakes / fakeImages.length) * maxScore) / 2
            : maxScore / 2; // If no fakes, give full correctness score

        // Time bonus: faster times get higher bonus (max 50 points)
        const maxTime = { 2: 10, 4: 30, 6: 60, 8: 120 }[boardSize];
        const timeBonus = (maxScore / 2) * (1 - Math.min(elapsedTime / (maxTime || 30), 1));

        // Ratio multiplier
        const ratioBaseScore = ratioType === "random" ? 25 : 0;
        const slope = (maxScore - ratioBaseScore) / maxScore;
        const finalScore = (correctnessScore + timeBonus) * slope + ratioBaseScore;

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
    images,
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
