import { useState, useRef } from 'react';

/**
 * Custom hook to handle double-click detection for adding images to albums
 */
const useDoubleClick = (onDoubleClick, onSingleClick) => {
  const clickTimer = useRef();

  const handleClick = (e) => {
    e.stopPropagation();

    if (clickTimer.current) {
      // This is a double-click
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick(e);
    } else {
      // This is a single click, wait to see if another click comes
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        if (onSingleClick) {
          onSingleClick(e);
        }
      }, 300);
    }
  };

  return handleClick;
};

export default useDoubleClick;
