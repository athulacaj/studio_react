import React, { useState } from 'react';
import { PhotoProofingContext } from './PhotoProofingContext';
import { ImageObj, Folder, PhotoProofingContextType } from '../types';

export const PhotoProofingProvider = ({ children }: { children: React.ReactNode }) => {

    const [loading, setLoading] = useState(true);

    const [albums, setAlbums] = useState<{ [key: string]: number[] }>({
        "favourites": [],
        "custom": [],
        "recent": []
    });
    const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
    const [images, setImages] = useState<ImageObj[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

    const handleAlbumChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedAlbum(event.target.value as string);
    };

    const handleAddToAlbum = (albumName: string, photoIndex: number) => {
        setAlbums((prevAlbums) => {
            const currentAlbum = prevAlbums[albumName] || [];
            if (currentAlbum.includes(photoIndex)) return prevAlbums;
            return {
                ...prevAlbums,
                [albumName]: [...currentAlbum, photoIndex],
            };
        });
    };

    const handleRemoveFromAlbum = (albumName: string, photoIndex: number) => {
        setAlbums((prevAlbums) => ({
            ...prevAlbums,
            [albumName]: (prevAlbums[albumName] || []).filter((index: number) => index !== photoIndex),
        }));
    };

    const navigateToFolder = (folderId: string | null, folderName: string) => {
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
        navigateToFolder,
        loading, setLoading
    };

    return (
        <PhotoProofingContext.Provider value={value}>
            {children}
        </PhotoProofingContext.Provider>
    );
};
