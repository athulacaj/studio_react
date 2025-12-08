import React from 'react';
import { IconButton, Box } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ZoomControls = ({ transformRef }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
                color="inherit"
                onClick={() => transformRef.current?.zoomIn()}
                aria-label="Zoom in"
            >
                <ZoomInIcon />
            </IconButton>
            <IconButton
                color="inherit"
                onClick={() => transformRef.current?.zoomOut()}
                aria-label="Zoom out"
            >
                <ZoomOutIcon />
            </IconButton>
            <IconButton
                color="inherit"
                onClick={() => transformRef.current?.resetTransform()}
                aria-label="Reset zoom"
            >
                <RestartAltIcon />
            </IconButton>
        </Box>
    );
};

export default ZoomControls;
