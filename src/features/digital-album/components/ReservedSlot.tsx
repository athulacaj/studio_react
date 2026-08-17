import { useState, useMemo } from 'react';
import {
  Popover,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useDigitalAlbumStore } from '../store/digitalAlbumStore';
import type { AlbumImage } from '../types';

interface ReservedSlotProps {
  slotId: string;
  images: AlbumImage[];
}

export default function ReservedSlot({ slotId, images }: ReservedSlotProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { placedImageIds, fillReservedSlot, deleteReservedSlot } = useDigitalAlbumStore();

  const unplacedImages = useMemo(
    () => images.filter((img) => !placedImageIds.includes(img.id)),
    [images, placedImageIds],
  );

  const handleOpenPicker = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelectImage = (imageId: string) => {
    fillReservedSlot(slotId, imageId);
    handleClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReservedSlot(slotId);
  };

  return (
    <div className="reserved-slot" style={{ width: '100%', height: '100%' }}>
      <div className="reserved-slot-inner">
        <Tooltip title="Select an image for this slot" arrow>
          <IconButton
            onClick={handleOpenPicker}
            sx={{
              color: '#A855F7',
              background: 'rgba(157, 78, 221, 0.1)',
              '&:hover': { background: 'rgba(157, 78, 221, 0.2)' },
            }}
          >
            <AddPhotoAlternateIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete this slot" arrow>
          <IconButton
            onClick={handleDelete}
            size="small"
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              color: 'rgba(148,163,184,0.6)',
              '&:hover': { color: '#ef4444', background: 'rgba(239,68,68,0.1)' },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography
          variant="caption"
          sx={{ color: 'rgba(148,163,184,0.5)', mt: 0.5, fontSize: '0.65rem' }}
        >
          Empty slot
        </Typography>
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              maxHeight: 360,
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
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#F8FAFC', mb: 1.5 }}>
          Select Image ({unplacedImages.length} available)
        </Typography>

        {unplacedImages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'rgba(148,163,184,0.6)' }}>
            <Typography variant="body2">No unplaced images available</Typography>
          </Box>
        ) : (
          <div className="unplaced-tray-grid">
            {unplacedImages.map((img) => (
              <div
                key={img.id}
                className="unplaced-tray-item"
                onClick={() => handleSelectImage(img.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectImage(img.id);
                }}
                aria-label={`Place image ${img.id} in this slot`}
              >
                <img src={img.url} alt={`Available ${img.id}`} loading="lazy" />
                <div className="add-overlay">
                  <AddCircleOutlineIcon sx={{ color: '#fff', fontSize: 24 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Popover>
    </div>
  );
}
