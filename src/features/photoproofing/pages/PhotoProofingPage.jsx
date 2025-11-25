import React from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange } = usePhotoProofing();
    return (
        <Box>
            <Header
                albums={albums}
                selectedAlbum={selectedAlbum}
                onAlbumChange={handleAlbumChange}
            />
            <Box sx={{ height: '50px' }} />
            <PhotoGrid />
        </Box>
    );
};

export default PhotoProofingPage;
