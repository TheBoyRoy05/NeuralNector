import CompletionModal from "./CompletionModal";
import Controls from "./Controls";
import Images from "./Images";

const Game = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-10 w-full min-h-[100vh]" id="game">
      <h2 className="font-regitha fl-text-3xl/4xl">Select the fake flowers</h2>
      <Controls />
      <Images />
      <CompletionModal />
    </section>
  );
};

export default Game;
