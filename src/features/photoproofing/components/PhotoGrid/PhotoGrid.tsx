import React, { useState, useEffect, useRef } from 'react';
import { Box, Pagination, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import EmptyState from './EmptyState';
import FullScreenView from '../FullScreenView';
import { PhotoProofingContextType, usePhotoProofing } from '../../context/PhotoProofingContext';

const PhotoGrid = () => {
    const { albums, selectedAlbum, images, handleAddToAlbum, handleRemoveFromAlbum, folders, navigateToFolder, breadcrumbs, currentFolderId }: PhotoProofingContextType = usePhotoProofing();
    const [fullScreenOpen, setFullScreenOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const prevAlbumRef = useRef(selectedAlbum);
    const prevFolderIdRef = useRef(currentFolderId);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 8;

    // Reset page to 1 when album or folder changes
    useEffect(() => {
        if (prevAlbumRef.current !== selectedAlbum || prevFolderIdRef.current !== currentFolderId) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('page', '1');
                return newParams;
            });
            prevAlbumRef.current = selectedAlbum;
            prevFolderIdRef.current = currentFolderId;
        }
    }, [selectedAlbum, currentFolderId, setSearchParams]);

    const handleOpenFullScreen = (index) => {
        setCurrentIndex(index);
        setFullScreenOpen(true);
    };

    const handleCloseFullScreen = () => {
        setFullScreenOpen(false);
    };

    const handlePageChange = (event, value) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', value.toString());
            return newParams;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const allDisplayedImages = selectedAlbum === 'all'
        ? images
        : albums[selectedAlbum]?.map(index => images[index]) || [];

    const totalPages = Math.ceil(allDisplayedImages.length / itemsPerPage);
    const paginatedImages = allDisplayedImages.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Box sx={{ p: 4, minHeight: '60vh' }}>
            {/* Breadcrumbs */}
            {selectedAlbum === 'all' && breadcrumbs.length > 0 && (
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return isLast ? (
                            <Typography key={crumb.id} color="text.primary">
                                {crumb.name}
                            </Typography>
                        ) : (
                            <Link
                                key={crumb.id}
                                underline="hover"
                                color="inherit"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigateToFolder(crumb.id, crumb.name);
                                }}
                            >
                                {crumb.name}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            )}

            {/* Folders */}
            {selectedAlbum === 'all' && folders && folders.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                    mb: 4
                }}>
                    {folders.map((folder) => (
                        <Card
                            key={folder.id}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                display: 'flex',
                                alignItems: 'center',
                                p: 2
                            }}
                            onClick={() => navigateToFolder(folder.id, folder.name)}
                        >
                            <FolderIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                            <Typography variant="h6" noWrap>
                                {folder.name}
                            </Typography>
                        </Card>
                    ))}
                </Box>
            )}

            {paginatedImages && paginatedImages.length > 0 ? (
                <>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 3,
                        mb: 4
                    }}>
                        {paginatedImages.map((imageObj, i) => {
                            const originalIndex = images.indexOf(imageObj);
                            const isLiked = (albums['favourites'] || []).includes(originalIndex);

                            return (
                                <PhotoCard
                                    key={originalIndex}
                                    imageObj={imageObj}
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

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
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
