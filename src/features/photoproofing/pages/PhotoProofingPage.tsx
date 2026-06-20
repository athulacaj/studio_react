import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import HeaderPhotoProofing from '../components/Header_photo_proofing';
import { ImageObj } from '../types';
import { CachedImage } from '../../../shared/utils/MakeGlobalImageCache';
import CategoryTabs from '../components/CategoryTabs';

const PhotoProofingPage = () => {
    const { albums, selectedAlbum, handleAlbumChange, images, currentImageIndex, categories } = usePhotoProofingStore();
    const allDisplayedImages: ImageObj[] = selectedAlbum === 'all'
        ? images
        : (albums[selectedAlbum] || [])
            .map((entry: string) => {
                try { return JSON.parse(entry) as ImageObj; } catch { return null; }
            })
            .filter((img): img is ImageObj => img !== null);


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
                categories={categories}
            />
            <Box sx={{ height: '70px' }} />
            <Box sx={{ px: { xs: 1, sm: 2 }, mb: 1 }}>
                <CategoryTabs handleAlbumChange={handleAlbumChange} />
            </Box>

            {!reload && <PhotoGrid allDisplayedImages={allDisplayedImages} />}
        </Box>
    );
};

export default PhotoProofingPage;
