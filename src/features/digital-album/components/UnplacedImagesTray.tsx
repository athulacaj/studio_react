import { useState, useMemo } from 'react';
import {
  Popover,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useDigitalAlbumStore } from '../store/digitalAlbumStore';
import type { AlbumImage } from '../types';

interface UnplacedImagesTrayProps {
  images: AlbumImage[];
}

export default function UnplacedImagesTray({ images }: UnplacedImagesTrayProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { placedImageIds, addToGrid } = useDigitalAlbumStore();

  const unplacedImages = useMemo(
    () => images.filter((img) => !placedImageIds.includes(img.id)),
    [images, placedImageIds],
  );

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddImage = (img: AlbumImage) => {
    addToGrid({ i: img.id, x: 0, y: Infinity, w: 3, h: 2 });
  };

  const handleAddAll = () => {
    unplacedImages.forEach((img) => {
      addToGrid({ i: img.id, x: 0, y: Infinity, w: 3, h: 2 });
    });
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={`Add images (${unplacedImages.length} available)`} arrow>
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            color: unplacedImages.length > 0 ? '#A855F7' : 'rgba(148,163,184,0.5)',
          }}
          disabled={unplacedImages.length === 0}
        >
          <Badge
            badgeContent={unplacedImages.length}
            color="secondary"
            max={99}
            invisible={unplacedImages.length === 0}
          >
            <AddPhotoAlternateIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              maxHeight: 420,
              borderRadius: '16px',
              background: 'rgba(15, 26, 46, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              p: 2,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
            Unplaced Images ({unplacedImages.length})
          </Typography>
          {unplacedImages.length > 1 && (
            <Tooltip title="Add all to grid" arrow>
              <IconButton size="small" onClick={handleAddAll} sx={{ color: '#A855F7' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>
                  Add All
                </Typography>
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {unplacedImages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'rgba(148,163,184,0.6)' }}>
            <Typography variant="body2">All images are on the grid! 🎉</Typography>
          </Box>
        ) : (
          <div className="unplaced-tray-grid">
            {unplacedImages.map((img) => (
              <div
                key={img.id}
                className="unplaced-tray-item"
                onClick={() => handleAddImage(img)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleAddImage(img);
                }}
                aria-label={`Add image ${img.id} to grid`}
              >
                <img src={img.url} alt={`Unplaced ${img.id}`} loading="lazy" />
                <div className="add-overlay">
                  <AddCircleOutlineIcon sx={{ color: '#fff', fontSize: 28 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Popover>
    </>
  );
}
