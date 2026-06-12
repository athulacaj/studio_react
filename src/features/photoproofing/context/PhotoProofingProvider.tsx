import React, { useState } from 'react';
import { PhotoProofingContext } from './PhotoProofingContext';
import { ImageObj, Folder } from '../types';

import { useSearchParams } from 'react-router-dom';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';



export const PhotoProofingProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        albums,
        setAlbums,
        handleAddToAlbum,
        handleRemoveFromAlbum,
        addToAlbumLoader
    } = usePhotoProofingStore()
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);

    // Initialize from URL (Single Source of Truth)
    const selectedAlbum = searchParams.get('album') || 'all';

    const [images, setImages] = useState<ImageObj[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    const currentFolderId = searchParams.get('folderId') || null;

    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [linkId, setLinkId] = useState<string | null>(null);
    const [sourceDirectoryHandle, setSourceDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [destinationDirectoryHandle, setDestinationDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);

    // Custom Setters to sync with URL
    const setSelectedAlbum: React.Dispatch<React.SetStateAction<string>> = (valueOrFn) => {
        setSearchParams(prev => {
            const current = prev.get('album') || 'all';
            const newValue = typeof valueOrFn === 'function' ? (valueOrFn as Function)(current) : valueOrFn;
            const newParams = new URLSearchParams(prev);
            if (newValue && newValue !== 'all') {
                newParams.set('album', newValue);
            } else {
                newParams.delete('album');
            }
            newParams.set('page', '1');
            return newParams;
        });
    };

    const setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>> = (valueOrFn) => {
        setSearchParams(prev => {
            const current = prev.get('folderId');
            const newValue = typeof valueOrFn === 'function' ? (valueOrFn as Function)(current) : valueOrFn;
            const newParams = new URLSearchParams(prev);
            if (newValue) {
                newParams.set('folderId', newValue);
            } else {
                newParams.delete('folderId');
            }
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handleAlbumChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedAlbum(event.target.value as string);
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
    const itemsPerPage = 8;
    const [imagesCache, setImagesCache] = useState<HTMLImageElement[]>([]);



    const value = {
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
        loading, setLoading,
        userId, setUserId,
        projectId, setProjectId,
        linkId, setLinkId,
        sourceDirectoryHandle, setSourceDirectoryHandle,
        destinationDirectoryHandle, setDestinationDirectoryHandle,
        currentImageIndex, setCurrentImageIndex,
        itemsPerPage,
        imagesCache,
        setImagesCache,
        addToAlbumLoader
    };

    return (
        <PhotoProofingContext.Provider value={value}>
            {children}
        </PhotoProofingContext.Provider>
    );
};
