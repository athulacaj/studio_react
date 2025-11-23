import React, { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import Header from '../../core/components/Header';
import PhotoGrid from '../../core/components/PhotoGrid';
import Footer from '../../core/components/Footer';
import Hero from '../../core/components/Hero';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo 500
    },
    secondary: {
      main: '#a855f7', // Purple 500
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          albums={albums}
          selectedAlbum={selectedAlbum}
          onAlbumChange={handleAlbumChange}
        />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Hero />
          <PhotoGrid
            albums={albums}
            setAlbums={setAlbums}
            selectedAlbum={selectedAlbum}
          />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;

