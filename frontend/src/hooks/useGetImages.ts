import { useEffect, useState } from "react";
import type { ImageProps } from "../components/Game/Images";
import useHTTP from "./useHTTP";
import { useGame } from "./useGame";

export default function useGetImages() {
  const { http } = useHTTP();
  const { boardSize, ratioType, imageRefreshKey } = useGame();
  const [images, setImages] = useState<ImageProps[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const totalImages = boardSize * boardSize;
      let numReal: number;
      let numFake: number;

      if (ratioType === "equal") {
        // Equal split
        numReal = Math.floor(totalImages / 2);
        numFake = totalImages - numReal;
      } else {
        // Random split
        numReal = Math.floor(Math.random() * (totalImages - 1)) + 1;
        numFake = totalImages - numReal;
      }

      const allImages: ImageProps[] = [];

      for (const body of [{ count: numReal, real: true }, { count: numFake, real: false }]) {
        await http({
          url: "/images",
          method: "GET",
          body: body,
          handleData: (data) => {
            allImages.push(...(data as ImageProps[]));
          },
        });
      }

      const shuffled = allImages.sort(() => Math.random() - 0.5);
      setImages(shuffled);
    };

    fetchImages();
  }, [http, boardSize, ratioType, imageRefreshKey]);

  return { images };
};
