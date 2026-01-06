import React from 'react';
import { IconButton, FormControl, Select, MenuItem, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const SlideshowControls = ({
    slideshowPlaying,
    onToggleSlideshow,
    slideshowSpeed,
    onSpeedChange,
    isFullscreen,
    onToggleFullscreen,
    isMobile
}) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 1 }}>
            {/* {!isMobile && ( */}
            <FormControl size="small" variant="standard" sx={{ minWidth: isMobile ? 50 : 100 }}>
                <Select
                    value={slideshowSpeed}
                    onChange={(e) => onSpeedChange(e.target.value)}
                    disableUnderline
                    sx={{
                        color: "white",
                        fontSize: '0.9rem',
                        '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                    }}
                >
                    <MenuItem value={1000}>1s</MenuItem>
                    <MenuItem value={3000}>3s</MenuItem>
                    <MenuItem value={5000}>5s</MenuItem>
                    <MenuItem value={10000}>10s</MenuItem>
                </Select>
            </FormControl>
            {/* )} */}

            <IconButton color="inherit" onClick={onToggleSlideshow} aria-label="Toggle slideshow" size={isMobile ? "small" : "medium"}>
                {slideshowPlaying ? <PauseIcon fontSize={isMobile ? "small" : "medium"} /> : <PlayArrowIcon fontSize={isMobile ? "small" : "medium"} />}
            </IconButton>

            <IconButton color="inherit" onClick={onToggleFullscreen} aria-label="Toggle fullscreen" size={isMobile ? "small" : "medium"}>
                {isFullscreen ? <FullscreenExitIcon fontSize={isMobile ? "small" : "medium"} /> : <FullscreenIcon fontSize={isMobile ? "small" : "medium"} />}
            </IconButton>
        </Box>
    );
};

export default SlideshowControls;
