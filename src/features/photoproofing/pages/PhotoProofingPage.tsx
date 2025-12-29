import React from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofingcontext } from '../context/PhotoProofingContext';
import HeaderPhotoProofing from '../components/Header_photo_proofing';
import { PhotoProofingContextType } from '../types';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange, images }: PhotoProofingContextType = usePhotoProofingcontext();
    const allDisplayedImages = selectedAlbum === 'all'
        ? images
        : (albums[selectedAlbum] || []).map((img: string) => JSON.parse(img));
    return (
        <Box>
            <HeaderPhotoProofing
                albums={albums}
                selectedAlbum={selectedAlbum}
                onAlbumChange={handleAlbumChange}
                allDisplayedImages={allDisplayedImages}
            />
            <Box sx={{ height: '50px' }} />
            <PhotoGrid allDisplayedImages={allDisplayedImages} />
        </Box>
    );
};

export default PhotoProofingPage;
