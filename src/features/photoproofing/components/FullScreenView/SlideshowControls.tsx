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
    onToggleFullscreen
}) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
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
                </Select>
            </FormControl>

            <IconButton color="inherit" onClick={onToggleSlideshow} aria-label="Toggle slideshow">
                {slideshowPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <IconButton color="inherit" onClick={onToggleFullscreen} aria-label="Toggle fullscreen">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
        </Box>
    );
};

export default SlideshowControls;
