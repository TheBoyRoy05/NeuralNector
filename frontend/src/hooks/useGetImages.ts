import { useEffect, useState } from "react";
import type { ImageProps } from "../components/Images";
import useHTTP from "./useHTTP";

interface UseGetImagesProps {
  numReal: number;
  numFake: number;
}

export default function useGetImages ({ numReal, numFake }: UseGetImagesProps) {
  const { http } = useHTTP();
  const [images, setImages] = useState<ImageProps[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
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
  }, [http, numReal, numFake]);

  return { images };
};
