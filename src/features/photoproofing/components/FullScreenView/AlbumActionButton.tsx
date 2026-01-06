import React from 'react';
import { Button, Box, Slide, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface AlbumActionButtonProps {
    controlsVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isImageInAlbum: boolean;
    selectedAlbum: string;
    onAction: () => void;
    slideshowPlaying: boolean;
    addToAlbumLoader: boolean;
    isMobile?: boolean;
}


const AlbumActionButton: React.FC<AlbumActionButtonProps> = ({
    controlsVisible,
    onMouseEnter,
    onMouseLeave,
    isImageInAlbum,
    selectedAlbum,
    onAction,
    slideshowPlaying,
    addToAlbumLoader,
    isMobile
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
                    bottom: isMobile ? 20 : 30,
                    width: '100%',
                    zIndex: 20,
                    pointerEvents: 'none'
                }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onAction}
                    disabled={addToAlbumLoader}
                    startIcon={
                        addToAlbumLoader ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : isImageInAlbum ? (
                            <CloseIcon />
                        ) : (
                            <FavoriteIcon />
                        )
                    }
                    sx={{
                        mx: 1,
                        borderRadius: 50,
                        px: isMobile ? 3 : 4,
                        py: isMobile ? 1 : 1.5,
                        textTransform: 'none',
                        fontSize: isMobile ? '0.875rem' : '1rem',
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
                        },
                        '&.Mui-disabled': {
                            background: isImageInAlbum
                                ? 'linear-gradient(45deg, #ef4444 30%, #dc2626 90%)'
                                : 'linear-gradient(45deg, #a855f7 30%, #6366f1 90%)',
                            color: 'white',
                            opacity: 0.8
                        }
                    }}
                >
                    {addToAlbumLoader ? 'Processing...' : isImageInAlbum ? (isMobile ? 'Remove' : `Remove from ${selectedAlbum}`) : (isMobile ? 'Add' : `Add to ${selectedAlbum}`)}
                </Button>
            </Box>
        </Slide>
    );
};

export default AlbumActionButton;
