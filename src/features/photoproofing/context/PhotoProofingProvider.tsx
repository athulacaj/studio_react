import React, { useState } from 'react';
import { PhotoProofingContext } from './PhotoProofingContext';
import { ImageObj, Folder, PhotoProofingContextType } from '../types';
import { db } from '../../../config/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { indexedDBService } from '../services/IndexedDBService';

import { useSearchParams } from 'react-router-dom';

export const PhotoProofingProvider = ({ children }: { children: React.ReactNode }) => {

    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);

    const [albums, setAlbums] = useState<{ [key: string]: any }>({
        "favourites": [],
        "custom": [],
        "recent": []
    });


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
    const [addToAlbumLoader, setAddToAlbumLoader] = useState(false);

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

    const handleAddToAlbum = async (albumName: string, image: ImageObj) => {
        image.folderPathList = breadcrumbs.map((b) => b.name).slice(1);
        if (!image || !image.id) return;
        setAddToAlbumLoader(true);
        // Sync with Firestore: Document ID is file ID
        if (userId && projectId && linkId) {
            const photoDocRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId, 'albums', image.id);

            setDoc(photoDocRef, {
                selections: arrayUnion(albumName),
                updatedAt: serverTimestamp(),
                image: JSON.stringify(image)
            }, { merge: true })
                .then(async () => {
                    // Also update IndexedDB
                    if (projectId) {
                        const localImage = await indexedDBService.getImageById(projectId, image.id);
                        const updatedSelections = localImage?.selections ? [...new Set([...localImage.selections, albumName])] : [albumName];
                        await indexedDBService.insertOrUpdateImage(projectId, {
                            ...localImage,
                            id: image.id,
                            selections: updatedSelections,
                            image: JSON.stringify(image)
                        });
                    }
                    setAlbums((prevAlbums) => {
                        const currentAlbum = prevAlbums[albumName] || [];
                        if (currentAlbum.includes(image.id)) return prevAlbums;

                        const newAlbums = {
                            ...prevAlbums,
                            [albumName]: [...currentAlbum, JSON.stringify(image)],
                        } as Record<string, string[]>;

                        return newAlbums;
                    });
                    setAddToAlbumLoader(false);
                })
                .catch(err => console.error("Error updating photo albums in Firestore:", err));
        }


    };

    const handleRemoveFromAlbum = (albumName: string, image: ImageObj) => {
        if (!image || !image.id) return;
        setAddToAlbumLoader(true);
        // Sync with Firestore: Document ID is file ID
        if (userId && projectId && linkId) {
            const photoDocRef = doc(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId, 'albums', image.id);

            setDoc(photoDocRef, {
                selections: arrayRemove(albumName),
                updatedAt: serverTimestamp(),
            }, { merge: true })
                .then(async () => {
                    // Also update IndexedDB
                    if (projectId) {
                        const localImage = await indexedDBService.getImageById(projectId, image.id);
                        if (localImage && localImage.selections) {
                            const updatedSelections = localImage.selections.filter((s: string) => s !== albumName);
                            await indexedDBService.insertOrUpdateImage(projectId, {
                                ...localImage,
                                selections: updatedSelections
                            });
                        }
                        setAlbums((prevAlbums) => {
                            const newAlbum = (prevAlbums[albumName] || []).filter((id: string) => id !== image.id);
                            const newAlbums = {
                                ...prevAlbums,
                                [albumName]: newAlbum,
                            };


                            return newAlbums;
                        });
                        setAddToAlbumLoader(false);
                    }
                })
                .catch(err => console.error("Error updating photo albums in Firestore:", err));
        }


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
