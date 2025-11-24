import { useState, useEffect } from 'react';

/**
 * Custom hook to manage slideshow functionality
 */
const useSlideshow = (onNext) => {
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(3000);

  useEffect(() => {
    let interval;
    if (slideshowPlaying) {
      interval = setInterval(() => {
        onNext();
      }, slideshowSpeed);
    }
    return () => clearInterval(interval);
  }, [slideshowPlaying, onNext, slideshowSpeed]);

  const toggleSlideshow = () => {
    setSlideshowPlaying(!slideshowPlaying);
  };

  return {
    slideshowPlaying,
    slideshowSpeed,
    setSlideshowSpeed,
    toggleSlideshow
  };
};

export default useSlideshow;
