import { useGame } from "../../hooks/useGame";
import useGetImages from "../../hooks/useGetImages";
import useGameLogic from "../../hooks/useGameLogic";
import FlipCard from "./FlipCard";

export interface ImageProps {
  image_id: string;
  image_data: string;
  is_real: boolean;
  score: number;
}

const Images = () => {
  const { images } = useGetImages();
  const { boardSize, isGameStarted, isReviewing, reviewResults, currentReviewIndex } = useGame();
  const { selectedImages, handleImageClick } = useGameLogic({ images });

  const imageSize = 512 / boardSize;
  const gridCols = `grid-cols-${boardSize}`;
  const gridWidth = boardSize * imageSize + (boardSize - 1) * 16;

  return (
    <div
      className={`grid ${gridCols} gap-4 items-center justify-center`}
      style={{ width: `${gridWidth}px` }}
    >
      {images.map((image, index) => {
        const isCurrentlyReviewing = isReviewing && currentReviewIndex >= index;
        const reviewResult = isCurrentlyReviewing ? reviewResults[image.image_id] : null;

        return (
          <FlipCard
            key={image.image_id}
            image={image}
            index={index}
            isFlipped={isGameStarted}
            size={imageSize}
            boardSize={boardSize}
            isSelected={selectedImages.has(image.image_id)}
            reviewResult={reviewResult}
            onClick={() => handleImageClick(image.image_id)}
          />
        );
      })}
    </div>
  );
};

export default Images;
