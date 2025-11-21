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
  const hideTimer = useRef();
  const clickTimer = useRef();

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
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
    if(isFullscreen) {
        clearTimeout(hideTimer.current);
        setControlsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if(isFullscreen) {
        hideTimer.current = setTimeout(() => {
            setControlsVisible(false);
          }, 3000);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      setControlsVisible(!isCurrentlyFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(hideTimer.current);
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

  if (!open) {
    return null;
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
        <Box sx={{height: '100vh', width: '100vw', backgroundColor: 'black', position: 'relative', overflow: 'hidden'}}>
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
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{ position: 'absolute', top: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 20 }}>
                    <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Photo {currentIndex + 1} of {images.length}
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="album-select-label" sx={{color: "white"}}>Album</InputLabel>
                        <Select
                        labelId="album-select-label"
                        value={selectedAlbum}
                        label="Album"
                        onChange={(e) => setSelectedAlbum(e.target.value)}
                        sx={{color: "white", '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' }}}
                        >
                        {Object.keys(albums).map((albumName) => (
                            <MenuItem key={albumName} value={albumName}>
                            {albumName}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="speed-select-label" sx={{color: "white"}}>Speed</InputLabel>
                        <Select
                        labelId="speed-select-label"
                        value={slideshowSpeed}
                        label="Speed"
                        onChange={(e) => setSlideshowSpeed(e.target.value)}
                        sx={{color: "white", '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' }}}
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
                    </Toolbar>
                </AppBar>
            </Slide>
            <Box
                sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                }}
            >
                 {showLikeAnimation && (
                    <FavoriteIcon className="like-animation" sx={{fontSize: '12rem'}}/>
                )}
                <IconButton onClick={handlePrev} sx={{position: 'absolute', left: 16, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1}}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <img
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                onClick={handleImageClick}
                />
                <IconButton onClick={handleNext} sx={{position: 'absolute', right: 16, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1}}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>
            {!slideshowPlaying && <Slide appear={false} direction="up" in={controlsVisible}>
                <Box 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 20, width: '100%', zIndex: 20 }}>
                    <Button variant="contained" color="success" onClick={handleAddToAlbum} sx={{mx: 1}}>
                    Add to {selectedAlbum}
                    </Button>
                </Box>
            </Slide>}
        </Box>
    </Dialog>
  );
};

export default FullScreenView;
