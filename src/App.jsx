import React, { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import PhotoGrid from './components/PhotoGrid';
import Footer from './components/Footer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [albums, setAlbums] = useState({
    "favourites": [],
    "custom": [],
    "recent": []
  });
  const [selectedAlbum, setSelectedAlbum] = useState('all');

  const handleAlbumChange = (event) => {
    setSelectedAlbum(event.target.value);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Header
        albums={albums}
        selectedAlbum={selectedAlbum}
        onAlbumChange={handleAlbumChange}
      />
      <PhotoGrid
        albums={albums}
        setAlbums={setAlbums}
        selectedAlbum={selectedAlbum}
      />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
