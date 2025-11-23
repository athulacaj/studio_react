import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import './FullScreenView.css';

const FullScreenView = ({
  images,
  currentIndex,
  onClose,
  onAddToAlbum,
  albums,
  open,
  setCurrentIndex,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState('favourites');
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(3000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const clickTimer = useRef();
  const transformComponentRef = useRef(null);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    resetZoom();
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    resetZoom();
  };

  const resetZoom = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  };

  const handleAddToAlbum = () => {
    onAddToAlbum(selectedAlbum, currentIndex);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);
    setTimeout(handleNext, 800);
  };

  const toggleSlideshow = () => {
    setSlideshowPlaying(!slideshowPlaying);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  const handleImageClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      handleAddToAlbum();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
      }, 300);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true);
      return;
    }

    if (isHovering) {
      setControlsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, isHovering]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (slideshowPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, slideshowSpeed);
    }
    return () => clearInterval(interval);
  }, [slideshowPlaying, handleNext, slideshowSpeed]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  if (!open) {
    return null;
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose} PaperProps={{
      style: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    }}>
      <Box sx={{ height: '100vh', width: '100vw', backgroundColor: '#06080fff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

        <Slide appear={false} direction="down" in={controlsVisible}>
          <AppBar
            position="absolute"
            elevation={0}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              top: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 1200
            }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close" sx={{ mr: 2 }}>
                  <CloseIcon />
                </IconButton>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, color: 'white' }}>
                  {currentIndex + 1} / {images.length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton color="inherit" onClick={() => transformComponentRef.current?.zoomIn()}>
                  <ZoomInIcon />
                </IconButton>
                <IconButton color="inherit" onClick={() => transformComponentRef.current?.zoomOut()}>
                  <ZoomOutIcon />
                </IconButton>
                <IconButton color="inherit" onClick={() => transformComponentRef.current?.resetTransform()}>
                  <RestartAltIcon />
                </IconButton>

                <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

                <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedAlbum}
                    onChange={(e) => setSelectedAlbum(e.target.value)}
                    disableUnderline
                    sx={{
                      color: "white",
                      fontSize: '0.9rem',
                      '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                    }}
                  >
                    {Object.keys(albums).map((albumName) => (
                      <MenuItem key={albumName} value={albumName}>
                        {albumName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
                  <Select
                    value={slideshowSpeed}
                    onChange={(e) => setSlideshowSpeed(e.target.value)}
                    disableUnderline
                    sx={{
                      color: "white",
                      fontSize: '0.9rem',
                      '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                    }}
                  >
                    <MenuItem value={1000}>1s</MenuItem>
                    <MenuItem value={3000}>3s</MenuItem>
                    <MenuItem value={5000}>5s</MenuItem>
                  </Select>
                </FormControl>

                <IconButton color="inherit" onClick={toggleSlideshow}>
                  {slideshowPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton color="inherit" onClick={handleToggleFullscreen}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        </Slide>

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
          {showLikeAnimation && (
            <FavoriteIcon className="like-animation" sx={{ fontSize: '12rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))', position: 'absolute', zIndex: 5, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}

          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 24,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              zIndex: 10,
              width: 48,
              height: 48
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.5}
            maxScale={8}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }} // Disable double click zoom to allow custom double click action
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <img
                  src={images[currentIndex]}
                  alt={`Photo ${currentIndex + 1}`}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.3s ease-in-out',
                    cursor: 'grab'
                  }}
                  onClick={handleImageClick}
                />
              </TransformComponent>
            )}
          </TransformWrapper>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 24,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              zIndex: 10,
              width: 48,
              height: 48
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        {!slideshowPlaying && (
          <Slide appear={false} direction="up" in={controlsVisible}>
            <Box
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 30,
                width: '100%',
                zIndex: 20,
                pointerEvents: 'none' // Allow clicks to pass through empty space
              }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddToAlbum}
                startIcon={<FavoriteIcon />}
                sx={{
                  mx: 1,
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(4px)',
                  background: 'linear-gradient(45deg, #a855f7 30%, #6366f1 90%)',
                  pointerEvents: 'auto', // Re-enable clicks for button
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Add to {selectedAlbum}
              </Button>
            </Box>
          </Slide>
        )}
      </Box>
    </Dialog>
  );
};

export default FullScreenView;
