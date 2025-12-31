import { useEffect, useRef } from "react";
import { useGame } from "../../hooks/useGame";
import useGetImages from "../../hooks/useGetImages";

const Controls = () => {
  const { images } = useGetImages();
  const {
    boardSize,
    setBoardSize,
    ratioType,
    setRatioType,
    isGameStarted,
    isReviewing,
    showCompletionModal,
    reviewResults,
    currentReviewIndex,
    elapsedTime,
    setElapsedTime,
    numSelected,
    startGame,
    startReview,
    resetGame,
  } = useGame();

  // Check if review is complete
  const isReviewComplete =
    showCompletionModal ||
    (isReviewing &&
      Object.keys(reviewResults).length > 0 &&
      currentReviewIndex >= images.length - 1);

  const startTimeRef = useRef<number | null>(null);

  // Timer effect - stops when reviewing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isGameStarted && !isReviewing) {
      // Initialize start time if not set, or account for existing elapsed time
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - elapsedTime * 1000;
      }

      interval = setInterval(() => {
        if (startTimeRef.current !== null) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds with decimals
          setElapsedTime(elapsed);
        }
      }, 100); // Update every 100ms for smooth display
    } else {
      // Reset start time when game stops or reviewing starts
      startTimeRef.current = null;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGameStarted, isReviewing, setElapsedTime, elapsedTime]);

  const handleStartClick = () => {
    if (isReviewComplete) {
      resetGame();
    } else if (isGameStarted && !isReviewing) {
      startReview();
    } else if (!isGameStarted) {
      startGame();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <select
          name="board-size"
          id="board-size"
          className="select select-outline select-lg w-[200px]"
          value={boardSize}
          onChange={(e) => setBoardSize(Number(e.target.value))}
          disabled={isGameStarted || isReviewing}
        >
          <option value="2">Easy</option>
          <option value="4">Normal</option>
          <option value="6">Hard</option>
          <option value="8">Impossible</option>
        </select>
        <select
          name="ratio-type"
          id="ratio-type"
          className="select select-outline select-lg w-[200px]"
          value={ratioType}
          onChange={(e) => setRatioType(e.target.value as "equal" | "random")}
          disabled={isGameStarted || isReviewing}
        >
          <option value="equal">Equal Ratio</option>
          <option value="random" title="Bonus points">Random Ratio</option>
        </select>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-around gap-4">
        <div className="text-2xl font-bold font-beezle w-32 text-center">
          Selected: <span className="font-bold font-sans">{numSelected}</span>
        </div>
        <button
          className="btn btn-primary btn-lg md:btn-xl order-first md:order-none"
          onClick={handleStartClick}
          disabled={isReviewing && !isReviewComplete}
        >
          {isReviewComplete
            ? "Restart"
            : isReviewing
            ? "Reviewing..."
            : isGameStarted
            ? "Submit"
            : "Start"}
        </button>
        <div className="text-2xl font-bold w-32 text-center">{formatTime(elapsedTime)}</div>
      </div>
    </div>
  );
};

export default Controls;
