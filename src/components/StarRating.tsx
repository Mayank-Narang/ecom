import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  className = '',
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const [displayRating, setDisplayRating] = useState(rating);

  // Update display rating when rating prop changes
  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  // Handle half-star ratings for display
  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = starValue <= Math.floor(displayRating);
    const hasHalfStar = !isFilled && starValue - 0.5 <= displayRating;

    const StarIcon = isFilled ? FaStar : 
                     hasHalfStar ? FaStarHalfAlt : FaRegStar;
    
    return (
      <label 
        key={index} 
        className={`${!readonly ? 'cursor-pointer' : 'cursor-default'}`}
        onMouseEnter={() => !readonly && setHover(starValue)}
        onMouseLeave={() => !readonly && setHover(null)}
      >
        <input
          type="radio"
          name="rating"
          value={starValue}
          onClick={() => handleClick(starValue)}
          className="sr-only"
          disabled={readonly}
          aria-label={`Rate ${starValue} out of 5`}
        />
        <StarIcon
          className="transition-colors duration-200"
          size={size}
          color={isFilled || hasHalfStar ? '#ffc107' : '#e4e5e9'}
          onMouseEnter={() => !readonly && setHover(starValue)}
          onMouseLeave={() => !readonly && setHover(null)}
        />
      </label>
    );
  };

  return (
    <div 
      className={`flex items-center ${className}`}
      role="slider"
      aria-valuenow={displayRating}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuetext={`${displayRating} out of 5 stars`}
      aria-readonly={readonly}
    >
      {[0, 1, 2, 3, 4].map(renderStar)}
      {!readonly && displayRating > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          {displayRating.toFixed(1)} stars
        </span>
      )}
    </div>
  );
};

export default StarRating;
