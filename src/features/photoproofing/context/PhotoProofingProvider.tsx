import React, { useState } from 'react';
import { PhotoProofingContext, PhotoProofingContextType } from './PhotoProofingContext';

export const PhotoProofingProvider = ({ children }) => {
    const [albums, setAlbums] = useState({
        "favourites": [],
        "custom": [],
        "recent": []
    });
    const [selectedAlbum, setSelectedAlbum] = useState('all');
    const [images, setImages] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

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

    const navigateToFolder = (folderId, folderName) => {
        setCurrentFolderId(folderId);
        if (folderId) {
            setBreadcrumbs(prev => {
                // Check if we are navigating back
                const index = prev.findIndex(b => b.id === folderId);
                if (index !== -1) {
                    return prev.slice(0, index + 1);
                }
                return [...prev, { id: folderId, name: folderName }];
            });
        } else {
            // Reset to root
            setBreadcrumbs([]);
        }
    };

    const value: PhotoProofingContextType = {
        albums,
        selectedAlbum,
        images,
        setAlbums,
        setSelectedAlbum,
        setImages,
        handleAlbumChange,
        handleAddToAlbum,
        handleRemoveFromAlbum,
        folders,
        setFolders,
        currentFolderId,
        setCurrentFolderId,
        breadcrumbs,
        setBreadcrumbs,
        navigateToFolder
    };

    return (
        <PhotoProofingContext.Provider value={value}>
            {children}
        </PhotoProofingContext.Provider>
    );
};
