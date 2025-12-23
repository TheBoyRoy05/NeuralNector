import Image from "./components/Image";
import useGetImages from "./hooks/useGetImages";

function App() {
  const { images } = useGetImages({ numReal: 8, numFake: 8 });
  
  return (
    <div>
      {images.map((image) => (
        <Image {...image} />
      ))}
    </div>
  );
}

export default App;
