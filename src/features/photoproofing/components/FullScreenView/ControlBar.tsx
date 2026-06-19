import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomControls from './ZoomControls';
import SlideshowControls from './SlideshowControls';
import AlbumSelector from '../AlbumSelector';

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
    isMobile?: boolean;
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
    onToggleFullscreen,
    isMobile
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
                    zIndex: 1200,
                    height: isMobile ? '56px' : '64px',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: isMobile ? '56px !important' : '64px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                            sx={{ mr: isMobile ? 1 : 2 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, color: 'white', fontSize: isMobile ? '0.9rem' : '1rem', whiteSpace: 'nowrap' }}>
                            {currentIndex + 1} / {totalImages}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
                        {!isMobile && (
                            <>
                                <ZoomControls transformRef={transformRef} />
                                <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
                            </>
                        )}

                        {/* <ToAddWhichAlbumSelector
                            onAlbumChange={onAlbumChange}
                            hideAll={true}
                        /> */}

                        <SlideshowControls
                            slideshowPlaying={slideshowPlaying}
                            onToggleSlideshow={onToggleSlideshow}
                            slideshowSpeed={slideshowSpeed}
                            onSpeedChange={onSpeedChange}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                            isMobile={isMobile}
                        />
                    </Box>
                </Toolbar>
            </AppBar>
        </Slide>
    );
};

export default ControlBar;
