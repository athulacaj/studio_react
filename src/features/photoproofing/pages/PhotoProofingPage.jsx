import React from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofing } from '../context/PhotoProofingContext';
import HeaderPhotoProofing from '../components/Header_photo_proofing';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange } = usePhotoProofing();
    return (
        <Box>
            <HeaderPhotoProofing
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
