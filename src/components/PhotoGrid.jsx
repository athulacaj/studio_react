import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
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
  'https://images.unsplash.com.com/photo-1561214115-f2f14dcc4363?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGFic3RyYWN0JTIwcGFpbnRpbmd8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
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
    <>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {displayedImages && displayedImages.map((image, index) => {
          const originalIndex = images.indexOf(image);
          return (
            <Grid item xs={12} sm={6} md={4} key={originalIndex}>
              <Card onClick={() => handleOpenFullScreen(originalIndex)} sx={{cursor: 'pointer'}}>
                <CardMedia
                  component="img"
                  height="250"
                  image={image}
                  alt={`Photo ${originalIndex + 1}`}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <FullScreenView
        open={fullScreenOpen}
        onClose={handleCloseFullScreen}
        images={images}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        albums={albums}
        onAddToAlbum={handleAddToAlbum}
      />
    </>
  );
};

export default PhotoGrid;
