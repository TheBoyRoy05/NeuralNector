import { useEffect, useState } from "react";
import type { ImageProps } from "../components/Image";
import useHTTP from "./useHTTP";

export default function useGetImages (realCount: number, fakeCount: number) {
  const { http } = useHTTP();
  const [images, setImages] = useState<ImageProps[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const allImages: ImageProps[] = [];

      for (const body of [{ count: realCount, real: true }, { count: fakeCount, real: false }]) {
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
  }, [http, realCount, fakeCount]);

  return { images };
};
