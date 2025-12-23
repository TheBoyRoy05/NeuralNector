import { FaGithub } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between w-full text-4xl p-8">
      <h1 className="font-regitha">Neural Nector</h1>
      <div className="flex items-center gap-4 text-black">
        <a
          href="https://github.com/TheBoyRoy05/NeuralNector"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
