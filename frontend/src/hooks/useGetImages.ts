import { useEffect } from "react";
import type { ImageProps } from "../components/Game/Images";
import useHTTP from "./useHTTP";
import { useGame } from "./useGame";

// Module-level ref to prevent duplicate fetches across all hook instances
let fetchingRef = false;
let lastFetchKeyRef = "";

export default function useGetImages() {
  const { http } = useHTTP();
  const { boardSize, ratioType, imageRefreshKey, setRatio, images, setImages } = useGame();

  useEffect(() => {
    const fetchKey = `${boardSize}-${ratioType}-${imageRefreshKey}`;
    
    // Prevent duplicate fetches across all instances
    if (fetchingRef || lastFetchKeyRef === fetchKey) {
      return;
    }

    // Clear images immediately to prevent showing wrong count during fetch
    setImages([]);

    const fetchImages = async () => {
      fetchingRef = true;
      lastFetchKeyRef = fetchKey;

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

      setRatio(`${numReal}:${numFake}`);

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
      fetchingRef = false;
    };

    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [http, boardSize, ratioType, imageRefreshKey]);

  return { images };
};
