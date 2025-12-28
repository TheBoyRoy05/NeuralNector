import { useEffect, useState } from "react";
import realFlower from "../assets/images/real.jpeg";
import fakeFlower from "../assets/images/fake.jpeg";
import ScrollArrow from "./ScrollArrow";
import { scrollTo } from "../Utils/functions";

const Landing = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center gap-[5vh] md:fl-gap-0/32 py-[8vh]">
      <h1 className="font-regitha fl-text-4xl/7xl">Neural Nector</h1>

      <div className="flex flex-col-reverse xl:flex-row items-center gap-[calc(8vw-2rem)]">
        <div className="flex flex-col items-center justify-center gap-8">
          <h2 className="font-regitha fl-text-2xl/4xl text-center">Can you tell the difference?</h2>
          <p className="fl-text-lg/2xl font-beezle text-center ">
            These flowers never grew in a garden... <br /> or did they?
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <button
              className="btn btn-primary btn-lg md:btn-xl"
              onClick={() => scrollTo("game", isMobile ? 120 : 50)}
            >
              Play
            </button>
            <a
              href="https://www.issacroy.com/#/neural-nector"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg md:w-36 md:order-first"
            >
              Learn More
            </a>
            <a
              className="btn btn-outline btn-lg md:w-36"
              href="https://github.com/TheBoyRoy05/NeuralNector"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 font-beezle text-4xl hidden md:flex">
          <img
            src={realFlower}
            alt="Real Flower"
            className="fl-w-32/64 object-cover rounded-lg border-2 -rotate-4"
            title="Real Flower"
          />
          vs.
          <img
            src={fakeFlower}
            alt="Fake Flower"
            className="fl-w-32/64 object-cover rounded-lg border-2 rotate-4"
            title="Fake Flower"
          />
        </div>
      </div>

      <ScrollArrow id="about" offset={isMobile ? 120 : 250} />
    </section>
  );
};

export default Landing;
