import React, { useState } from 'react';
import { PhotoProofingContext } from './PhotoProofingContext';

export const PhotoProofingProvider = ({ children }) => {
    const [albums, setAlbums] = useState({
        "favourites": [],
        "custom": [],
        "recent": []
    });
    const [selectedAlbum, setSelectedAlbum] = useState('all');
    const [images, setImages] = useState([]);

    const handleAlbumChange = (event) => {
        setSelectedAlbum(event.target.value);
    };

    const handleAddToAlbum = (albumName, photoIndex) => {
        setAlbums((prevAlbums) => {
            const currentAlbum = prevAlbums[albumName] || [];
            if (currentAlbum.includes(photoIndex)) return prevAlbums;
            return {
                ...prevAlbums,
                [albumName]: [...currentAlbum, photoIndex],
            };
        });
    };

    const handleRemoveFromAlbum = (albumName, photoIndex) => {
        setAlbums((prevAlbums) => ({
            ...prevAlbums,
            [albumName]: (prevAlbums[albumName] || []).filter(index => index !== photoIndex),
        }));
    };

    const value = {
        albums,
        selectedAlbum,
        images,
        setAlbums,
        setSelectedAlbum,
        setImages,
        handleAlbumChange,
        handleAddToAlbum,
        handleRemoveFromAlbum
    };

    return (
        <PhotoProofingContext.Provider value={value}>
            {children}
        </PhotoProofingContext.Provider>
    );
};
