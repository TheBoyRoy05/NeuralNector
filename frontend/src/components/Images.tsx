import useGetImages from "../hooks/useGetImages";

const Images = () => {
  const { images } = useGetImages({ numReal: 8, numFake: 8 });

  return (
    <div className="grid grid-cols-4 gap-4 items-center justify-center w-[640px]">
      {images.map((image, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <img src={image.image_data} alt="Image" className="w-[128px] h-[128px] object-cover" />
          <p>{image.is_real ? "Real" : "Fake"}</p>
        </div>
      ))}
    </div>
  );
};

export default Images;
