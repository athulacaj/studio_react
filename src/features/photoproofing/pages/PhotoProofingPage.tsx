import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofingcontext } from '../context/PhotoProofingContext';
import HeaderPhotoProofing from '../components/Header_photo_proofing';
import { ImageObj, PhotoProofingContextType } from '../types';
import { CachedImage } from '../../../shared/utils/MakeGlobalImageCache';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange, images, currentImageIndex }: PhotoProofingContextType = usePhotoProofingcontext();
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
