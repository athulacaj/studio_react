import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomControls from './ZoomControls';
import AlbumSelector from './AlbumSelector';
import SlideshowControls from './SlideshowControls';

interface ControlBarProps {
    controlsVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClose: () => void;
    currentIndex: number;
    totalImages: number;
    transformRef: React.RefObject<any>;
    selectedAlbum: string;
    onAlbumChange: (album: string) => void;
    albums: Record<string, string[]>;
    slideshowPlaying: boolean;
    onToggleSlideshow: () => void;
    slideshowSpeed: number;
    onSpeedChange: (speed: number) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
    controlsVisible,
    onMouseEnter,
    onMouseLeave,
    onClose,
    currentIndex,
    totalImages,
    transformRef,
    selectedAlbum,
    onAlbumChange,
    albums,
    slideshowPlaying,
    onToggleSlideshow,
    slideshowSpeed,
    onSpeedChange,
    isFullscreen,
    onToggleFullscreen
}) => {
    return (
        <Slide appear={false} direction="down" in={controlsVisible}>
            <AppBar
                position="absolute"
                elevation={0}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                sx={{
                    top: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 1200
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                            sx={{ mr: 2 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, color: 'white' }}>
                            {currentIndex + 1} / {totalImages}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ZoomControls transformRef={transformRef} />

                        <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

                        <AlbumSelector
                            selectedAlbum={selectedAlbum}
                            onAlbumChange={onAlbumChange}
                            albums={albums}
                        />

                        <SlideshowControls
                            slideshowPlaying={slideshowPlaying}
                            onToggleSlideshow={onToggleSlideshow}
                            slideshowSpeed={slideshowSpeed}
                            onSpeedChange={onSpeedChange}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                        />
                    </Box>
                </Toolbar>
            </AppBar>
        </Slide>
    );
};

export default ControlBar;
