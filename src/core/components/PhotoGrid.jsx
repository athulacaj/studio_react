import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  Box,
  Typography
} from '@mui/material';
import FullScreenView from './FullScreenView';

const images = [
  'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1549492423-40021226e2fb?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1561214115-f2f14dcc4363?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjR8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjV8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
  'https://images.unsplash.com/photo-1542779283-429940ce8336?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjd8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
];

const PhotoGrid = ({ albums, setAlbums, selectedAlbum }) => {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpenFullScreen = (index) => {
    setCurrentIndex(index);
    setFullScreenOpen(true);
  };

  const handleCloseFullScreen = () => {
    setFullScreenOpen(false);
  };

  const handleAddToAlbum = (albumName, photoIndex) => {
    setAlbums((prevAlbums) => ({
      ...prevAlbums,
      [albumName]: [...(prevAlbums[albumName] || []), photoIndex],
    }));
  };

  const displayedImages = selectedAlbum === 'all'
    ? images
    : albums[selectedAlbum]?.map(index => images[index]);

  return (
    <Box sx={{ p: 4, minHeight: '60vh' }}>
      {displayedImages && displayedImages.length > 0 ? (
        <Grid container spacing={3}>
          {displayedImages.map((image, index) => {
            const originalIndex = images.indexOf(image);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={originalIndex}>
                <Card
                  onClick={() => handleOpenFullScreen(originalIndex)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    bgcolor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #334155', // slate-700
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.05)',
                      },
                      '& .overlay': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }
                    }
                  }}
                  elevation={0}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={image}
                    alt={`Photo ${originalIndex + 1}`}
                    sx={{
                      transition: 'transform 0.5s ease',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.3s',
                    }}
                  />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h5" color="text.secondary">
            No photos in this album yet.
          </Typography>
        </Box>
      )}
      <FullScreenView
        open={fullScreenOpen}
        onClose={handleCloseFullScreen}
        images={images}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        albums={albums}
        onAddToAlbum={handleAddToAlbum}
      />
    </Box>
  );
};

export default PhotoGrid;
