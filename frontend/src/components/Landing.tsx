import realFlower from "../assets/images/real.jpeg";
import fakeFlower from "../assets/images/fake.jpeg";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center gap-[5vh] md:gap-[15vh] py-[10vh]">
      <h1 className="font-regitha fl-text-4xl/7xl hidden md:block">Neural Nector</h1>
      <div className="flex flex-col-reverse xl:flex-row items-center gap-[10vw]">
        <div className="flex flex-col items-center justify-center gap-8">
          <h2 className="font-regitha fl-text-2xl/4xl">Can you tell the difference?</h2>
          <p className="fl-text-lg/2xl font-beezle max-w-[300px] md:max-w-[400px] text-center ">
            These flowers never grew in a garden... or did they?
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <button className="btn btn-primary btn-lg md:btn-xl">Play</button>
            <a className="btn btn-accent btn-lg md:w-[140px] md:order-first">Learn More</a>
            <a
              className="btn btn-outline btn-lg md:w-[140px]"
              href="https://github.com/TheBoyRoy05/NeuralNector"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 font-beezle text-4xl">
          <img
            src={realFlower}
            alt="Real Flower"
            className="fl-w-48/64 object-cover rounded-lg border-2 border-gray-300 md:-rotate-4"
            title="Real Flower"
          />
          vs.
          <img
            src={fakeFlower}
            alt="Fake Flower"
            className="fl-w-48/64 object-cover rounded-lg border-2 border-gray-300 md:rotate-4"
            title="Fake Flower"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
