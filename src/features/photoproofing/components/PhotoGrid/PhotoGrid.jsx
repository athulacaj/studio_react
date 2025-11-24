import React, { useState } from 'react';
import { Box } from '@mui/material';
import PhotoCard from './PhotoCard';
import EmptyState from './EmptyState';
import FullScreenView from '../FullScreenView';
import { usePhotoProofing } from '../../context/PhotoProofingContext';

const images = [
    ...Array.from({ length: 100 }, (_, i) => `https://picsum.photos/seed/${i + 1}/800/600`),
];

const PhotoGrid = () => {
    const { albums, selectedAlbum, handleAddToAlbum, handleRemoveFromAlbum } = usePhotoProofing();
    const [fullScreenOpen, setFullScreenOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOpenFullScreen = (index) => {
        setCurrentIndex(index);
        setFullScreenOpen(true);
    };

    const handleCloseFullScreen = () => {
        setFullScreenOpen(false);
    };

    const displayedImages = selectedAlbum === 'all'
        ? images
        : albums[selectedAlbum]?.map(index => images[index]);

    return (
        <Box sx={{ p: 4, minHeight: '60vh' }}>
            {displayedImages && displayedImages.length > 0 ? (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    },
                    gap: 3
                }}>
                    {displayedImages.map((image) => {
                        const originalIndex = images.indexOf(image);
                        const isLiked = (albums['favourites'] || []).includes(originalIndex);

                        return (
                            <PhotoCard
                                key={originalIndex}
                                image={image}
                                index={originalIndex}
                                isLiked={isLiked}
                                onOpenFullScreen={handleOpenFullScreen}
                                selectedAlbum={selectedAlbum}
                                albums={albums}
                                onAddToAlbum={handleAddToAlbum}
                                onRemoveFromAlbum={handleRemoveFromAlbum}
                            />
                        );
                    })}
                </Box>
            ) : (
                <EmptyState />
            )}

            <FullScreenView
                open={fullScreenOpen}
                onClose={handleCloseFullScreen}
                images={images}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                albums={albums}
                onAddToAlbum={handleAddToAlbum}
                onRemoveFromAlbum={handleRemoveFromAlbum}
            />
        </Box>
    );
};

export default PhotoGrid;
