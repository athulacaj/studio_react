import React from 'react';
import { Button, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

const AlbumActionButton = ({
    controlsVisible,
    onMouseEnter,
    onMouseLeave,
    isImageInAlbum,
    selectedAlbum,
    onAction,
    slideshowPlaying
}) => {
    if (slideshowPlaying) return null;

    return (
        <Slide appear={false} direction="up" in={controlsVisible}>
            <Box
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: 30,
                    width: '100%',
                    zIndex: 20,
                    pointerEvents: 'none'
                }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onAction}
                    startIcon={isImageInAlbum ? <CloseIcon /> : <FavoriteIcon />}
                    sx={{
                        mx: 1,
                        borderRadius: 50,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(4px)',
                        background: isImageInAlbum
                            ? 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)'
                            : 'linear-gradient(45deg, #a855f7 30%, #6366f1 90%)',
                        pointerEvents: 'auto',
                        '&:hover': {
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                        }
                    }}
                >
                    {isImageInAlbum ? `Remove from ${selectedAlbum}` : `Add to ${selectedAlbum}`}
                </Button>
            </Box>
        </Slide>
    );
};

export default AlbumActionButton;
