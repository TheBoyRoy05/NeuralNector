import { useGame } from "../../hooks/useGame";
import useGetImages from "../../hooks/useGetImages";
import useGameLogic from "../../hooks/useGameLogic";
import useResponsive from "../../hooks/useResponsive";
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
  const { size: screenWidth } = useResponsive();

  const imageSize = 512 / boardSize;
  
  // Calculate responsive columns: mobile uses fewer columns, desktop uses full boardSize
  const columns = screenWidth < 600
    ? Math.max(1, Math.min(4, Math.floor(boardSize / 2)))
    : screenWidth < 768
    ? Math.min(4, boardSize)
    : boardSize;
  
  // Calculate grid width based on actual columns
  const gridWidth = columns * imageSize + (columns - 1) * 16;

  return (
    <div
      className="grid gap-4 items-center justify-center"
      style={{ 
        width: `${gridWidth}px`,
        gridTemplateColumns: `repeat(${columns}, ${imageSize}px)`
      }}
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
