import { useGame } from "../../hooks/useGame";
import useGetImages from "../../hooks/useGetImages";
import useGameLogic from "../../hooks/useGameLogic";
import useResponsive from "../../hooks/useResponsive";
import FlipCard from "./FlipCard";

export interface ImageProps {
  image_id: string;
  image_data: string;
  is_real: boolean;
}

const Images = () => {
  const { images, loading } = useGetImages();
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
      className="grid gap-4 items-center justify-center min-h-[512px]"
      style={{ 
        width: `${gridWidth}px`,
        gridTemplateColumns: `repeat(${columns}, ${imageSize}px)`
      }}
    >
      {loading && (
        <span className="col-span-full flex justify-center" aria-hidden="true">
          <span className="loading loading-ring loading-3xl w-24" />
        </span>
      )}
      {images.map((image, index) => {
        const isCurrentlyReviewing = isReviewing && currentReviewIndex >= index;
        const reviewResult = isCurrentlyReviewing ? reviewResults[image.image_id] : null;

        return (
          <FlipCard
            key={`${image.image_id}-${index}`}
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
