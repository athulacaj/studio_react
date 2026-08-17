import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';

interface AlbumGridItemProps {
  imageUrl: string;
  imageId: string;
  isEditing: boolean;
  onRemove?: (id: string) => void;
}

const AlbumGridItem = React.forwardRef<
  HTMLDivElement,
  AlbumGridItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ imageUrl, imageId, isEditing, onRemove, style, className, children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`album-grid-item ${!isEditing ? 'readonly' : ''} ${className ?? ''}`}
      style={style}
      {...rest}
    >
      <img src={imageUrl} alt={`Album image ${imageId}`} loading="lazy" />

      {isEditing && (
        <div className="album-item-overlay">
          <Tooltip title="Drag to move" arrow placement="top">
            <span className="drag-handle album-drag-handle">
              <DragIndicatorIcon fontSize="small" />
            </span>
          </Tooltip>

          {onRemove && (
            <Tooltip title="Remove from grid" arrow placement="top">
              <IconButton
                className="remove-btn"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(imageId);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )}

      {/* react-grid-layout injects resize handle here */}
      {children}
    </div>
  );
});

AlbumGridItem.displayName = 'AlbumGridItem';

export default AlbumGridItem;
