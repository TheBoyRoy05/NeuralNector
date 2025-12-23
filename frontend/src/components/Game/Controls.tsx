import { useGame } from "../../hooks/useGame";

const Controls = () => {
  const { highScore, boardSize, setBoardSize, difficulty, setDifficulty } = useGame();

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
      <button className="btn btn-primary btn-lg md:btn-xl">
        {highScore > 0 ? "Restart" : "Start"}
      </button>
      <select
        name="board-size"
        id="board-size"
        className="select select-outline select-lg md:order-first max-w-[200px]"
        value={boardSize}
        onChange={(e) => setBoardSize(Number(e.target.value))}
      >
        <option value="2">Board Size: 2x2</option>
        <option value="4">Board Size: 4x4</option>
        <option value="6">Board Size: 6x6</option>
      </select>
      <select
        name="difficulty"
        id="difficulty"
        className="select select-outline select-lg max-w-[200px]"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as "easy" | "hard")}
      >
        <option value="easy">Equal Real/Fake</option>
        <option value="hard">Random Real/Fake</option>
      </select>
    </div>
  );
};

export default Controls;
