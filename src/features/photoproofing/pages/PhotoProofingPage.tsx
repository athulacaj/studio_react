import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import HeaderPhotoProofing from '../components/Header_photo_proofing';
import { ImageObj } from '../types';
import { CachedImage } from '../../../shared/utils/MakeGlobalImageCache';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange, images, currentImageIndex } = usePhotoProofingStore();
    const allDisplayedImages = selectedAlbum === 'all'
        ? images
        : (albums[selectedAlbum]?.images || []).map((img: string) => JSON.parse(img));

    const [reload, setReload] = useState(true);
    useEffect(() => {
        setReload(true);
        setTimeout(() => {
            setReload(false);
        }, 100);
    }, [selectedAlbum]);



    return (
        <Box>
            <HeaderPhotoProofing
                albums={albums}
                selectedAlbum={selectedAlbum}
                onAlbumChange={handleAlbumChange}
                allDisplayedImages={allDisplayedImages}
            />
            <Box sx={{ height: '50px' }} />

            {!reload && <PhotoGrid allDisplayedImages={allDisplayedImages} />}
        </Box>
    );
};

export default PhotoProofingPage;
