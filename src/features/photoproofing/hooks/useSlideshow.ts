import { useState, useEffect } from 'react';

/**
 * Custom hook to manage slideshow functionality
 */
const useSlideshow = (onNext, currentIndex, totalImages) => {
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(3000);

  // Handle slideshow interval
  useEffect(() => {
    let interval;
    if (slideshowPlaying) {
      // Check if we are at the last image
      if (currentIndex === totalImages - 1) {
        setSlideshowPlaying(false);
        return;
      }

      interval = setInterval(() => {
        // We need to check again inside the interval or rely on the effect re-running
        // Since onNext updates the index, this effect will re-run.
        // However, the check above handles the "start while at end" or "arrived at end" case.
        // But if we are at index 0, start playing, we want it to go 0 -> 1 -> ... -> last -> stop.
        // The onNext function updates the state, which triggers a re-render, 
        // which triggers this effect again with new currentIndex.
        onNext();
      }, slideshowSpeed);
    }
    return () => clearInterval(interval);
  }, [slideshowPlaying, onNext, slideshowSpeed, currentIndex, totalImages]);

  // Handle window focus and visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSlideshowPlaying(false);
      }
    };

    const handleWindowBlur = () => {
      setSlideshowPlaying(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  const toggleSlideshow = () => {
    // If we are at the last image and try to start, we might want to restart or just not start.
    // For now, let's allow it to start, but the effect will immediately stop it if we don't handle it.
    // If user clicks play at the end, maybe we should go to start?
    // The requirement says "end the sideshow after viewing lastslide".
    // If I am at the last slide and click play, it should probably go to the first slide or just stop.
    // Let's assume standard behavior: if at end, maybe wrap around or just stop.
    // But the requirement is to STOP after viewing last slide.
    // If I manually navigate to last slide and click play, it should probably do nothing or stop immediately.
    // Let's just toggle state. The effect will handle the stop.
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
