import { useGame } from "../../hooks/useGame";

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

  const getDifficultyName = () => {
    if (boardSize === 2) return "Easy";
    if (boardSize === 4) return "Normal";
    if (boardSize === 6) return "Hard";
    if (boardSize === 8) return "Impossible";
    return "Normal";
  };

  const correctCount = Object.values(reviewResults).filter((r) => r === "correct").length;
  const totalCount = Object.keys(reviewResults).length;
  const highScore = highScores[boardSize] || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showCompletionModal) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-regitha text-3xl font-bold mb-4">Congratulations!</h3>
        <p className="font-beezle text-lg mb-4">
          You beat the <span className="font-bold">{getDifficultyName()}</span> mode with{" "}
          <span className="font-bold">{correctCount}/{totalCount}</span> correct in{" "}
          <span className="font-bold">{formatTime(elapsedTime)}</span>
        </p>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-beezle">Your Score (Time Bonus +{timeBonus}):</span>
            <span className="font-bold text-xl">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-beezle">High Score ({getDifficultyName()}):</span>
            <span className="font-bold text-xl">{highScore}</span>
          </div>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-primary"
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

