import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Box, useTheme, useMediaQuery } from '@mui/material';
import { ImageObj } from '../../types';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Components
// Hooks
import useFullscreenControls from '../../hooks/useFullscreenControls';
import useSlideshow from '../../hooks/useSlideshow';
import useImageNavigation from '../../hooks/useImageNavigation';
import useDoubleClick from '../../hooks/useDoubleClick';
import ControlBar from './ControlBar';
import LikeAnimation from './LikeAnimation';
import NavigationButton from './NavigationButton';
import ImageViewer from './ImageViewer';
import AlbumActionButton from './AlbumActionButton';
import FullScreenLoader from './FullScreenLoader';
import { usePhotoProofingStore } from '../../store/usePhotoProofingStore';
import { indexedDBService } from '../../services/IndexedDBService';
import { CachedImage } from '../../../../shared/utils/MakeGlobalImageCache';

interface FullScreenViewProps {
    images: ImageObj[];
    onClose: () => void;
    open: boolean;
    currentImage: ImageObj;
}

const FullScreenView: React.FC<FullScreenViewProps> = ({
    images,
    onClose,
    open,
    currentImage
}) => {
    const { albums, toAddWhichAlbum, handleAddToAlbum, addToAlbumLoader, handleRemoveFromAlbum, projectId, currentImageIndex, setCurrentImageIndex } = usePhotoProofingStore();
    const [isImageInAlbum, setIsImageInAlbum] = useState(false);

    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const transformComponentRef = useRef<any>(null);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        // When currentImage changes, reset index and show loader
        setTimeout(() => {
            setLoader(false);
        }, 1000);
        setTimeout(() => {
            setCurrentImageIndex(
                images.findIndex((image) => image.id === currentImage.id)
            );
        }, 1);
    }, [currentImage]);



    // Custom hooks
    const { isFullscreen, controlsVisible, toggleFullscreen, setControlsVisible } = useFullscreenControls(isHovering);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const resetZoom = () => {
        if (transformComponentRef.current) {
            transformComponentRef.current.resetTransform();
        }
    };

    const { handleNext, handlePrev } = useImageNavigation(
        currentImageIndex,
        setCurrentImageIndex,
        images.length,
        resetZoom
    );

    const { slideshowPlaying, slideshowSpeed, setSlideshowSpeed, toggleSlideshow } = useSlideshow(
        handleNext,
        currentImageIndex,
        images.length
    );

    // Check if current image is in the selected album using IndexedDB
    useEffect(() => {
        if (addToAlbumLoader) return;
        const checkAlbumStatus = async () => {
            if (!projectId || !images[currentImageIndex]?.id) {
                setIsImageInAlbum(false);
                return;
            }

            try {
                const imageRecord = await indexedDBService.getImageById(projectId, images[currentImageIndex].id);
                if (imageRecord && imageRecord.selections) {
                    setIsImageInAlbum(imageRecord.selections.includes(toAddWhichAlbum));
                } else {
                    setIsImageInAlbum(false);
                }
            } catch (error) {
                console.error("Error checking album status from IndexedDB:", error);
                setIsImageInAlbum(false);
            }
        };

        if (currentImageIndex >= 0) {
            checkAlbumStatus();
        }
    }, [projectId, currentImageIndex, toAddWhichAlbum, albums, addToAlbumLoader]);

    const onhandleAddToAlbum = () => {
        if (!toAddWhichAlbum) {
            return;
        }
        if (isImageInAlbum) {
            handleRemoveFromAlbum(toAddWhichAlbum, images[currentImageIndex]);
        } else {
            handleAddToAlbum(toAddWhichAlbum, images[currentImageIndex]);
            setShowLikeAnimation(true);
            setTimeout(() => setShowLikeAnimation(false), 2000);
        }
    };

    const handleSingleClick = () => {
        setControlsVisible((prev) => !prev);
    };

    const handleImageClick = useDoubleClick(handleAddToAlbum, handleSingleClick);

    const handleMouseEnter = () => !isMobile && setIsHovering(true);
    const handleMouseLeave = () => !isMobile && setIsHovering(false);

    // Touch handling for swipe navigation (mainly for mobile)
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // Ensure we don't swipe if zoomed in (simple check could be checking ref scale, but here assuming single touch swipe is nav)
        // Ideally we check transformComponentRef.current.state.scale but types might be loose.
        // For now, let's assume swipe works if not actively pinch-zooming (which usually involves two fingers).
        // Since touchStart tracks one finger, this is likely a swipe.

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    // Reset zoom when image changes
    useEffect(() => {
        resetZoom();
    }, [currentImageIndex]);

    const [preloadImages, setPreloadImages] = useState<ImageObj[]>([]);


    function preloadImagesFn(imgIndex: number) {
        // preoload 3 images 
        const r = []
        const limit = 3;
        let count = 0;
        for (let i = imgIndex + 1; i < images.length; i++) {
            r.push(images[i])
            count++;
            if (count >= limit) {
                break;
            }
        }
        setPreloadImages(r);
    }


    useEffect(() => {
        const refTimeout = setTimeout(() => {
            preloadImagesFn(currentImageIndex);
        }, 1000)
        return () => {
            clearTimeout(refTimeout)
        }
    }, [currentImageIndex])

    useEffect(() => {
        console.log("albums changed ")
    }, [albums])



    if (!open) {
        return null;
    }

    console.log("rerender")

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            }}
        >
            <Box display={"none"}>
                {
                    preloadImages.map((img: ImageObj, index: number) => (
                        <CachedImage src={img.src} className="cached-image"
                            alt={img.name ?? ''}
                            key={img.id || index}
                            style={{
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                transition: 'opacity 0.3s ease-in-out',
                                pointerEvents: 'none',
                                userSelect: 'none'
                            }}
                        />
                    ))
                }
            </Box>

            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#06080fff',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Hover detection area for top controls - Only on desktop */}
                {!isMobile && (
                    <Box
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100px',
                            zIndex: 10
                        }}
                    />
                )}

                {/* Top Control Bar */}
                {toAddWhichAlbum &&
                    <ControlBar
                        controlsVisible={controlsVisible}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClose={onClose}
                        currentIndex={currentImageIndex}
                        totalImages={images.length}
                        transformRef={transformComponentRef}
                        selectedAlbum={toAddWhichAlbum}
                        albums={albums}
                        slideshowPlaying={slideshowPlaying}
                        onToggleSlideshow={toggleSlideshow}
                        slideshowSpeed={slideshowSpeed}
                        onSpeedChange={setSlideshowSpeed}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                        isMobile={isMobile}
                    />
                }

                {/* Main Image Area */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    {/* Like Animation */}
                    <LikeAnimation show={showLikeAnimation} />

                    {/* Previous Button */}
                    {
                        controlsVisible &&
                        <NavigationButton
                            onClick={handlePrev}
                            icon={ArrowBackIosNewIcon}
                            position="left"
                        />
                    }

                    {/* Image Viewer with Zoom */}
                    <ImageViewer
                        transformRef={transformComponentRef}
                        image={images[currentImageIndex]?.src ?? ""}
                        imageName={images[currentImageIndex]?.name ?? "no image available"}
                        onImageClick={handleImageClick}
                    />

                    {/* Loader */}
                    <FullScreenLoader show={loader} />

                    {/* Next Button */}
                    {
                        controlsVisible &&
                        <NavigationButton
                            onClick={handleNext}
                            icon={ArrowForwardIosIcon}
                            position="right"
                        />
                    }
                </Box>

                {/* Bottom Album Action Button */}
                {toAddWhichAlbum && <AlbumActionButton
                    controlsVisible={controlsVisible}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    isImageInAlbum={isImageInAlbum}
                    selectedAlbum={toAddWhichAlbum}
                    onAction={onhandleAddToAlbum}
                    addToAlbumLoader={addToAlbumLoader}
                    slideshowPlaying={slideshowPlaying}
                    isMobile={isMobile}
                />}
            </Box>
        </Dialog>

    );
};

export default FullScreenView;
