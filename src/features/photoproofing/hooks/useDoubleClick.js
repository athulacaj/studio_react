import { useState, useRef } from 'react';

/**
 * Custom hook to handle double-click detection for adding images to albums
 */
const useDoubleClick = (onDoubleClick) => {
  const clickTimer = useRef();

  const handleClick = (e) => {
    e.stopPropagation();

    if (clickTimer.current) {
      // This is a double-click
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
    } else {
      // This is a single click, wait to see if another click comes
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        // Single click action (currently none, but could toggle controls)
      }, 300);
    }
  };

  return handleClick;
};

export default useDoubleClick;
