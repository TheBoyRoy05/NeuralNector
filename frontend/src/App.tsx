import Footer from "./components/Footer";
import Game from "./components/Game/Game";
import About from "./components/About";
import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import { useThemeHandler } from "./hooks/useThemeHandler";

function App() {
  useThemeHandler();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center gap-8 flex-1 overflow-auto px-[10vw]">
        <Landing />
        <About />
        <Game />
      </main>
      <Footer />
    </div>
  );
}

export default App;
