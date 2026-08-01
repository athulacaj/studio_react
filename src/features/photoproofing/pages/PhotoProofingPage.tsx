import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import HeaderPhotoProofing from '../components/Header_photo_proofing';
import { ImageObj } from '../types';
import { CachedImage } from '../../../shared/utils/MakeGlobalImageCache';
import CategoryTabs from '../components/CategoryTabs';
import { useSearchParams } from 'react-router-dom';

const PhotoProofingPage = () => {
    const { albums, images, categories } = usePhotoProofingStore();
    const [searchParams] = useSearchParams();
    const selectedAlbum = searchParams.get('selectedAlbum') || 'all';
    const allDisplayedImages: ImageObj[] = selectedAlbum === 'all'
        ? images
        : (albums[selectedAlbum] as ImageObj[] || []);

    // .map((entry: any) => {
    //     try { return JSON.parse(entry.image) as ImageObj; } catch { return null; }
    // })
    // .filter((img): img is ImageObj => img !== null);


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
                // onAlbumChange={handleAlbumChange}
                allDisplayedImages={allDisplayedImages}
                categories={categories}
            />
            <Box sx={{ height: { xs: '56px', sm: '64px' } }} />
            <Box sx={{
                px: { xs: 1, sm: 2 },
                py: 1,
                position: 'sticky',
                top: { xs: '56px', sm: '64px' },
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <CategoryTabs />
            </Box>

            {!reload && <PhotoGrid allDisplayedImages={allDisplayedImages} />}
        </Box>
    );
};

export default PhotoProofingPage;
