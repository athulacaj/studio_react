import React from 'react';
import Hero from '../core/components/Hero';
import PhotoGrid from '../core/components/PhotoGrid';
import { Box } from '@mui/material';

const Home = ({ albums, setAlbums, selectedAlbum }) => {
    return (
        <Box>
            <Hero />
            <PhotoGrid
                albums={albums}
                setAlbums={setAlbums}
                selectedAlbum={selectedAlbum}
            />
        </Box>
    );
};

export default Home;
