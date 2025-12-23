import { useEffect } from "react";
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
    startGame, 
    startReview,
    resetGame
  } = useGame();
  
  // Check if review is complete
  const isReviewComplete = showCompletionModal || 
    (isReviewing && Object.keys(reviewResults).length > 0 && currentReviewIndex >= images.length - 1);

  // Timer effect - stops when reviewing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isGameStarted && !isReviewing) {
      interval = setInterval(() => {
        const currentTime = useGame.getState().elapsedTime;
        setElapsedTime(currentTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGameStarted, isReviewing, setElapsedTime]);

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
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
      <button
        className="btn btn-primary btn-lg md:btn-xl"
        onClick={handleStartClick}
        disabled={isReviewing && !isReviewComplete}
      >
        {isReviewComplete ? "Restart" : isReviewing ? "Reviewing..." : isGameStarted ? "Submit" : "Start"}
      </button>
      <div className="text-2xl font-bold">
        {formatTime(elapsedTime)}
      </div>
      <select
        name="board-size"
        id="board-size"
        className="select select-outline select-lg md:order-first max-w-[225px]"
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
        className="select select-outline select-lg max-w-[225px]"
        value={ratioType}
        onChange={(e) => setRatioType(e.target.value as "equal" | "random")}
        disabled={isGameStarted || isReviewing}
      >
        <option value="equal">Equal Ratio</option>
        <option value="random">Random Ratio (x1.33)</option>
      </select>
    </div>
  );
};

export default Controls;
