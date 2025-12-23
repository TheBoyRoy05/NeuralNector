import { FaGithub } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "../hooks/useThemeHandler";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between gap-8 w-full p-8 sticky top-0 z-10 bg-base-100 border-b-2 border-gray-300">
      <div className="flex items-center justify-between w-full">
        <h1 className="font-regitha text-4xl">Neural Nector</h1>
        <label className="swap swap-rotate md:hidden">
          <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen((prev) => !prev)} />
          <IoClose aria-label="enabled" className="swap-on text-2xl" />
          <GiHamburgerMenu aria-label="disabled" className="swap-off text-2xl" />
        </label>
      </div>

      <div
        className={`w-full font-beezle items-center justify-end flex-col md:flex md:flex-row gap-6 text-2xl ${
          menuOpen ? "flex" : "hidden"
        }`}
      >
        <a
          href="https://github.com/TheBoyRoy05/NeuralNector"
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation"
          className="link-hover"
        >
          Learn More
        </a>
        <a
          href="https://issacroy.com/#/"
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation"
          className="link-hover"
        >
          My Website
        </a>
        
        <label className="swap swap-rotate hidden md:inline-grid" id="theme-toggle" title="Toggle Theme">
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <MdLightMode className="swap-off" aria-label="disabled" />
          <MdDarkMode className="swap-on" aria-label="enabled" />
        </label>
        <button className="md:hidden" onClick={toggleTheme}>Toggle Theme</button>

        <a
          href="https://github.com/TheBoyRoy05/NeuralNector"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          className="link-hover"
        >
          <FaGithub className="hidden md:block" />
          <span className="block md:hidden">GitHub</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
