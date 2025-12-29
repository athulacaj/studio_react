import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Box } from '@mui/material';
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

interface FullScreenViewProps {
    images: ImageObj[];
    currentIndex: number;
    onClose: () => void;
    onAddToAlbum: (albumName: string, index: number) => void;
    onRemoveFromAlbum: (albumName: string, index: number) => void;
    albums: Record<string, string[]>;
    open: boolean;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const FullScreenView: React.FC<FullScreenViewProps> = ({
    images,
    currentIndex,
    onClose,
    onAddToAlbum,
    onRemoveFromAlbum,
    albums,
    open,
    setCurrentIndex,
}) => {
    const [selectedAlbum, setSelectedAlbum] = useState('favourites');
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const transformComponentRef = useRef<any>(null);

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

    // Check if current image is in the selected album
    const isImageInAlbum = (albums[selectedAlbum] || []).includes(images[currentIndex]?.id);

    const handleAddToAlbum = () => {
        if (isImageInAlbum) {
            onRemoveFromAlbum(selectedAlbum, currentIndex);
        } else {
            onAddToAlbum(selectedAlbum, currentIndex);
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
                        image={images[currentIndex].src}
                        imageIndex={currentIndex}
                        onImageClick={handleImageClick}
                    />

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
                    onAction={handleAddToAlbum}
                    slideshowPlaying={slideshowPlaying}
                />
            </Box>
        </Dialog>
    );
};

export default FullScreenView;
