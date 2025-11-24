import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = ({ message = "No photos in this album yet." }) => {
    return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default EmptyState;
