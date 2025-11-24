import { useState, useEffect } from 'react';

/**
 * Custom hook to manage fullscreen state and controls visibility
 */
const useFullscreenControls = (isHovering) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Manage controls visibility based on fullscreen state and hover
  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true);
      return;
    }

    if (isHovering) {
      setControlsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, isHovering]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  return {
    isFullscreen,
    controlsVisible,
    toggleFullscreen
  };
};

export default useFullscreenControls;
