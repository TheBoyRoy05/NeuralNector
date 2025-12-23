import Image from "./components/Image";
import useGetImages from "./hooks/useGetImages";

function App() {
  const { images } = useGetImages(8, 8);
  
  return (
    <div>
      {images.map((image) => (
        <Image {...image} />
      ))}
    </div>
  );
}

export default App;
