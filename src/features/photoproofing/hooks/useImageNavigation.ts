import { useEffect, useCallback } from 'react';

/**
 * Custom hook to manage image navigation with keyboard support
 */
const useImageNavigation = (currentIndex, setCurrentIndex, imagesLength, resetZoom) => {
  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesLength);
    resetZoom();
  }, [setCurrentIndex, imagesLength, resetZoom]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imagesLength) % imagesLength);
    resetZoom();
  }, [setCurrentIndex, imagesLength, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  return {
    handleNext,
    handlePrev
  };
};

export default useImageNavigation;
