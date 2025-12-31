import { useRef, useEffect, useState } from "react";
import type { ImageProps } from "./Images";

interface FlipCardProps {
  image: ImageProps;
  index: number;
  isFlipped: boolean;
  size: number;
  boardSize: number;
  isSelected: boolean;
  reviewResult: "correct" | "incorrect" | null;
  onClick: () => void;
}

const FlipCard = ({ image, index, isFlipped, size, boardSize, isSelected, reviewResult, onClick }: FlipCardProps) => {
  // Calculate delay and duration based on board size
  const getAnimationTiming = () => {
    if (boardSize === 2) {
      return { delay: index * 100, duration: 0.8 }; // Easy - slower
    } else if (boardSize === 4) {
      return { delay: index * 50, duration: 0.6 }; // Normal - medium
    } else if (boardSize === 6) {
      return { delay: index * 30, duration: 0.5 }; // Hard - faster
    } else if (boardSize === 8) {
      return { delay: index * 20, duration: 0.4 }; // Impossible - fastest
    } else {
      return { delay: index * 50, duration: 0.6 }; // default
    }
  };

  const { delay, duration } = getAnimationTiming();
  const prevFlippedRef = useRef(isFlipped);
  const [isFlippingBack, setIsFlippingBack] = useState(false);

  // Track when flipping back
  useEffect(() => {
    if (prevFlippedRef.current && !isFlipped) {
      // Flipping from true to false - need to flip back (all cards flip back simultaneously)
      setTimeout(() => setIsFlippingBack(true), 0);
      const timer = setTimeout(() => setIsFlippingBack(false), duration * 1000);
      return () => clearTimeout(timer);
    } else if (!prevFlippedRef.current && isFlipped) {
      // Flipping forward - reset flip-back state
      setTimeout(() => setIsFlippingBack(false), 0);
    }
    prevFlippedRef.current = isFlipped;
  }, [isFlipped, duration]);
  const questionMarkSize = 
    size === 64 ? "text-2xl" : 
    size === 96 ? "text-3xl" : 
    size === 256 ? "text-6xl" : 
    "text-4xl";
  
  // Determine border styling based on review result or selection
  let borderClass = "border-secondary";
  let borderWidth = "border-2";
  
  if (reviewResult === "correct") {
    borderClass = "border-success";
    borderWidth = "border-4";
  } else if (reviewResult === "incorrect") {
    borderClass = "border-error";
    borderWidth = "border-4";
  } else if (isSelected) {
    borderClass = "border-primary";
    borderWidth = "border-4";
  }

  const isClickable = isFlipped && reviewResult === null;
  const showRealFakeLabel = reviewResult !== null;
  
  // Calculate badge size based on card size
  const badgeSize = 
    size === 64 ? "text-xs px-1.5 py-0.5" : 
    size === 96 ? "text-sm px-2 py-1" : 
    size === 256 ? "text-lg px-3 py-1.5" : 
    "text-base px-2.5 py-1";
  
  return (
    <div
      className={`flip-card-container ${isClickable ? "cursor-pointer" : "cursor-default"} relative`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`
      }}
      onClick={() => isClickable && onClick()}
    >
      <div
        className={`flip-card ${isFlipped ? "flipped" : isFlippingBack ? "flip-back" : ""}`}
        style={{ 
          animationDelay: isFlippingBack ? "0ms" : `${delay}ms`,
          animationDuration: `${duration}s`
        }}
      >
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div
              className={`bg-base-300 rounded-lg flex items-center justify-center ${borderClass} ${borderWidth} transition-all`}
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <span className={questionMarkSize}>?</span>
            </div>
          </div>
          <div className="flip-card-back relative">
            <img
              src={image.image_data}
              alt="Image"
              className={`object-cover rounded-lg ${borderClass} ${borderWidth} transition-all`}
              style={{ width: `${size}px`, height: `${size}px` }}
            />
            {showRealFakeLabel && (
              <div
                className={`absolute top-2 left-2 ${badgeSize} font-bold rounded-md shadow-lg ${
                  image.is_real 
                    ? "bg-success text-success-content" 
                    : "bg-error text-error-content"
                }`}
              >
                {image.is_real ? "REAL" : "FAKE"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;

