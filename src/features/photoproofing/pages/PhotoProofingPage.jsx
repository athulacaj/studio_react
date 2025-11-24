import React from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';

const PhotoProofingPage = ({ albums, setAlbums, selectedAlbum }) => {
    return (
        <Box>
            <Box sx={{ height: '50px' }} />
            <PhotoGrid
                albums={albums}
                setAlbums={setAlbums}
                selectedAlbum={selectedAlbum}
            />
        </Box>
    );
};

export default PhotoProofingPage;
