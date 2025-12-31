import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Box } from '@mui/material';
import { ImageObj, PhotoProofingContextType } from '../../types';
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
import { usePhotoProofingcontext } from '../../context/PhotoProofingContext';
import { useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { indexedDBService } from '../../services/IndexedDBService';

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
    const { albums, handleAddToAlbum, handleRemoveFromAlbum, projectId }: PhotoProofingContextType = usePhotoProofingcontext();
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isImageInAlbum, setIsImageInAlbum] = useState(false);

    const [selectedAlbum, setSelectedAlbum] = useState('favourites');
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
            setCurrentIndex(
                images.findIndex((image) => image.id === currentImage.id)
            );
        }, 1);
    }, [currentImage]);



    // Custom hooks
    const { isFullscreen, controlsVisible, toggleFullscreen } = useFullscreenControls(isHovering);

    const resetZoom = () => {
        if (transformComponentRef.current) {
            transformComponentRef.current.resetTransform();
        }
    };

    const { handleNext, handlePrev } = useImageNavigation(
        currentIndex,
        setCurrentIndex,
        images.length,
        resetZoom
    );

    const { slideshowPlaying, slideshowSpeed, setSlideshowSpeed, toggleSlideshow } = useSlideshow(
        handleNext,
        currentIndex,
        images.length
    );

    // Check if current image is in the selected album using IndexedDB
    useEffect(() => {
        const checkAlbumStatus = async () => {
            if (!projectId || !images[currentIndex]?.id) {
                setIsImageInAlbum(false);
                return;
            }

            try {
                const imageRecord = await indexedDBService.getImageById(projectId, images[currentIndex].id);
                if (imageRecord && imageRecord.selections) {
                    setIsImageInAlbum(imageRecord.selections.includes(selectedAlbum));
                } else {
                    setIsImageInAlbum(false);
                }
            } catch (error) {
                console.error("Error checking album status from IndexedDB:", error);
                setIsImageInAlbum(false);
            }
        };

        if (currentIndex >= 0) {
            checkAlbumStatus();
        }
    }, [projectId, currentIndex, selectedAlbum, albums]);

    const onhandleAddToAlbum = () => {
        if (isImageInAlbum) {
            handleRemoveFromAlbum(selectedAlbum, images[currentIndex]);
        } else {
            handleAddToAlbum(selectedAlbum, images[currentIndex]);
            setShowLikeAnimation(true);
            setTimeout(() => setShowLikeAnimation(false), 2000);
        }
    };

    const handleImageClick = useDoubleClick(handleAddToAlbum);

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Reset zoom when image changes
    useEffect(() => {
        resetZoom();
    }, [currentIndex]);

    if (!open) {
        return null;
    }

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
            >
                {/* Hover detection area for top controls */}
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

                {/* Top Control Bar */}
                <ControlBar
                    controlsVisible={controlsVisible}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClose={onClose}
                    currentIndex={currentIndex}
                    totalImages={images.length}
                    transformRef={transformComponentRef}
                    selectedAlbum={selectedAlbum}
                    onAlbumChange={setSelectedAlbum}
                    albums={albums}
                    slideshowPlaying={slideshowPlaying}
                    onToggleSlideshow={toggleSlideshow}
                    slideshowSpeed={slideshowSpeed}
                    onSpeedChange={setSlideshowSpeed}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                />

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
                    <NavigationButton
                        onClick={handlePrev}
                        icon={ArrowBackIosNewIcon}
                        position="left"
                    />

                    {/* Image Viewer with Zoom */}
                    <ImageViewer
                        transformRef={transformComponentRef}
                        image={images[currentIndex]?.src ?? ""}
                        imageName={images[currentIndex]?.name ?? "no image available"}
                        onImageClick={handleImageClick}
                    />

                    {/* Loader */}
                    <FullScreenLoader show={loader} />

                    {/* Next Button */}
                    <NavigationButton
                        onClick={handleNext}
                        icon={ArrowForwardIosIcon}
                        position="right"
                    />
                </Box>

                {/* Bottom Album Action Button */}
                <AlbumActionButton
                    controlsVisible={controlsVisible}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    isImageInAlbum={isImageInAlbum}
                    selectedAlbum={selectedAlbum}
                    onAction={onhandleAddToAlbum}
                    slideshowPlaying={slideshowPlaying}
                />
            </Box>
        </Dialog>
    );
};

export default FullScreenView;
