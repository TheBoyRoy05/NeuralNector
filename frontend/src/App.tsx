import Image from "./components/Image";
import Navbar from "./components/Navbar";
import useGetImages from "./hooks/useGetImages";

function App() {
  const { images } = useGetImages({ numReal: 8, numFake: 8 });
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Navbar />
      <div className="flex flex-wrap gap-4 items-center justify-center h-screen">
        {images.map((image, index) => (
          <Image key={index} {...image} />
        ))}
      </div>
    </div>
  );
}

export default App;
