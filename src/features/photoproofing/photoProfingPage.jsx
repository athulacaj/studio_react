import React from 'react';
import Hero from '../../core/components/Hero';
import PhotoGrid from '../../core/components/PhotoGrid';
import { Box } from '@mui/material';

const PhotoProfingPage = ({ albums, setAlbums, selectedAlbum }) => {
    return (
        <Box>
            {/* <Hero /> */}
            <Box sx={{ height: '50px' }} />

            <PhotoGrid
                albums={albums}
                setAlbums={setAlbums}
                selectedAlbum={selectedAlbum}
            />
        </Box>
    );
};

export default PhotoProfingPage;
