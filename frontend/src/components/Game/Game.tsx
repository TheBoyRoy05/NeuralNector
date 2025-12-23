import Controls from "./Controls";
import Images from "./Images";

const Game = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-10 w-full min-h-[100vh]" id="game">
      <Controls />
      <Images />
    </section>
  );
};

export default Game;
