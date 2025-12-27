import { useGame } from "../../hooks/useGame";
import { getDifficultyName } from "../../Utils/functions";
import Leaderboard from "./Leaderboard";

const CompletionModal = () => {
  const {
    boardSize,
    elapsedTime,
    reviewResults,
    score,
    timeBonus,
    highScores,
    showCompletionModal,
    setShowCompletionModal,
    resetGame,
  } = useGame();

  const correctCount = Object.values(reviewResults).filter((r) => r === "correct").length;
  const totalCount = Object.keys(reviewResults).length;
  const highScore = highScores[boardSize] || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!showCompletionModal) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-regitha text-3xl font-bold mb-4">Congratulations!</h3>
        <p className="font-beezle text-xl mb-4">
          You beat the <span className="font-bold">{getDifficultyName(boardSize)}</span> mode with{" "}
          <span className="font-bold font-sans">
            {correctCount}/{totalCount}
          </span>{" "}
          correct in <span className="font-bold font-sans">{formatTime(elapsedTime)}</span>
        </p>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-beezle text-lg">
              Your Score (Time Bonus
              <span className="font-bold font-sans"> +{timeBonus.toFixed(2)}</span>):
            </span>
            <span className="font-bold text-xl">{score.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-beezle text-lg">
              High Score ({getDifficultyName(boardSize)}):
            </span>
            <span className="font-bold text-xl">{highScore.toFixed(2)}</span>
          </div>
        </div>
        <Leaderboard />
        <div className="modal-action">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setShowCompletionModal(false);
              resetGame();
            }}
          >
            Restart
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setShowCompletionModal(false)}>close</button>
      </form>
    </dialog>
  );
};

export default CompletionModal;
