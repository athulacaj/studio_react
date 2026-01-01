import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Pagination, Breadcrumbs, Link, Typography, Card } from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import EmptyState from './EmptyState';
import FullScreenView from '../FullScreenView';
import { usePhotoProofingcontext } from '../../context/PhotoProofingContext';
import { PhotoProofingContextType, ImageObj } from '../../types';
import { globalImageCache } from '../../../../shared/utils/MakeGlobalImageCache';

const PhotoGrid = ({ allDisplayedImages }: { allDisplayedImages: ImageObj[] }) => {
    const { albums, selectedAlbum, images, itemsPerPage,
        folders, navigateToFolder, breadcrumbs, currentFolderId,
        imagesCache, setImagesCache, }: PhotoProofingContextType = usePhotoProofingcontext();
    const [fullScreenOpen, setFullScreenOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<ImageObj | null>(null);

    const prevAlbumRef = useRef(selectedAlbum);
    const prevFolderIdRef = useRef(currentFolderId);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);

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

    const handleOpenFullScreen = (imageObj: ImageObj) => {
        setCurrentImage(imageObj);
        setFullScreenOpen(true);
    };

    const handleCloseFullScreen = () => {
        setFullScreenOpen(false);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', value.toString());
            return newParams;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const totalPages = Math.ceil(allDisplayedImages.length / itemsPerPage);
    const paginatedImages =
        useMemo(() => allDisplayedImages.slice((page - 1) * itemsPerPage, page * itemsPerPage), [allDisplayedImages, page, itemsPerPage]);


    // useEffect(() => {
    //     paginatedImages.forEach(e => {
    //         if (e.src) {
    //             const img = globalImageCache.getImageElement(e.src, true, {
    //                 alt: e.name,
    //                 loading: 'lazy',
    //                 className: 'MuiCardMedia-root',
    //                 style: {
    //                     position: 'absolute',
    //                     top: 0,
    //                     left: 0,
    //                     width: '100%',
    //                     height: '100%',
    //                     objectFit: 'cover',
    //                     transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    //                 }
    //             })
    //             if (img)
    //                 document.getElementById('images_cache')?.appendChild(img)
    //         }
    //     })
    // }, [paginatedImages])



    if (fullScreenOpen && currentImage) {
        return (
            <FullScreenView
                open={fullScreenOpen}
                onClose={handleCloseFullScreen}
                images={images}
                currentImage={currentImage}
            />
        )
    }
    return (
        <Box sx={{ p: 4, minHeight: '60vh' }}>
            {/* Breadcrumbs */}
            {selectedAlbum === 'all' && breadcrumbs.length > 0 && (
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    {breadcrumbs.map((crumb: any, index: number) => {
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
                        {paginatedImages.map((imageObj) => {
                            const originalIndex = images.indexOf(imageObj);
                            const isLiked = (albums['favourites'] || []).includes(imageObj.id);

                            return (
                                <PhotoCard
                                    key={originalIndex}
                                    imageObj={imageObj}
                                    isLiked={isLiked}
                                    onOpenFullScreen={handleOpenFullScreen}

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


        </Box>
    );
};

export default PhotoGrid;
