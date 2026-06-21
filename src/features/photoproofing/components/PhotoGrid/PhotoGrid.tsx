import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Pagination, Breadcrumbs, Link, Typography, Card, TextField, useTheme, useMediaQuery } from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import EmptyState from './EmptyState';
import FullScreenView from '../FullScreenView';
import { usePhotoProofingStore } from '../../store/usePhotoProofingStore';
import { ImageObj } from '../../types';
import { globalImageCache } from '../../../../shared/utils/MakeGlobalImageCache';

const PhotoGrid = ({ allDisplayedImages }: { allDisplayedImages: ImageObj[] }) => {
    const { albums, selectedAlbum, images, itemsPerPage,
        folders, navigateToFolder, breadcrumbs, currentFolderId, setBreadcrumbs,
        imagesCache } = usePhotoProofingStore();
    const [fullScreenOpen, setFullScreenOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<ImageObj | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const [jumpPage, setJumpPage] = useState(page.toString());

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setJumpPage(page.toString());
    }, [page]);

    // Reset page to 1 when album or folder changes
    const prevAlbumRef = useRef(selectedAlbum);
    const prevFolderRef = useRef(currentFolderId);

    useEffect(() => {
        if (prevAlbumRef.current !== selectedAlbum || prevFolderRef.current !== currentFolderId) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                // newParams.set('page', '1');
                if (currentFolderId) {
                    newParams.set('folderId', currentFolderId);
                }
                const encodedBreadcrumbs = btoa(JSON.stringify(breadcrumbs));
                newParams.set('breadcrumbs', encodedBreadcrumbs);
                return newParams;
            });
            prevAlbumRef.current = selectedAlbum;
            prevFolderRef.current = currentFolderId;
        } else {
            if (searchParams.get('folderId')) {
                navigateToFolder(searchParams.get('folderId')!, "")
            }
            if (searchParams.get('breadcrumbs')) {
                const decodedBreadcrumbs = atob(searchParams.get('breadcrumbs')!);
                setBreadcrumbs(JSON.parse(decodedBreadcrumbs));
            }
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
        useMemo(() => allDisplayedImages.slice((page - 1) * itemsPerPage, page * itemsPerPage),
            [allDisplayedImages, page, itemsPerPage]);


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
                images={allDisplayedImages}
                currentImage={currentImage}
            />
        )
    }
    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '60vh' }}>
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
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: { xs: 2, sm: 3 },
                        mb: 4
                    }}>
                        {paginatedImages.map((imageObj) => {
                            const originalIndex = images.indexOf(imageObj);
                            const isLiked = false;
                            // (albums['favourites'] || []).includes(imageObj.id);

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
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 1, sm: 2, md: 3 },
                            mt: 5,
                            mb: 2,
                            width: '100%',
                            p: { xs: 1.5, md: 3 },
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap'
                        }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size={isMobile ? "small" : "large"}
                                siblingCount={isMobile ? 0 : 1}
                                boundaryCount={isMobile ? 1 : 2}
                                showFirstButton={!isMobile}
                                showLastButton={!isMobile}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
                                {!isMobile && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Go to:
                                    </Typography>
                                )}
                                <TextField
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 1, max: totalPages, style: { textAlign: 'center', padding: isMobile ? '6px' : '8px' } }}
                                    value={jumpPage}
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt(jumpPage, 10);
                                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                                handlePageChange(e as any, val);
                                            } else {
                                                setJumpPage(page.toString());
                                            }
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const val = parseInt(jumpPage, 10);
                                        if (!isNaN(val) && val >= 1 && val <= totalPages && val !== page) {
                                            handlePageChange(e as any, val);
                                        } else {
                                            setJumpPage(page.toString());
                                        }
                                    }}
                                    sx={{
                                        width: isMobile ? '50px' : '70px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        }
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    / {totalPages}
                                </Typography>
                            </Box>
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
