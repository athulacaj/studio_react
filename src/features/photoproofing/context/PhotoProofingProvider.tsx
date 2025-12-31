import React, { useState } from 'react';
import { PhotoProofingContext } from './PhotoProofingContext';
import { ImageObj, Folder, PhotoProofingContextType, SelectedImageObj } from '../types';
import { db } from '../../../config/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { indexedDBService } from '../services/IndexedDBService';

export const PhotoProofingProvider = ({ children }: { children: React.ReactNode }) => {

    const [loading, setLoading] = useState(true);

    const [albums, setAlbums] = useState<{ [key: string]: any }>({
        "favourites": [],
        "custom": [],
        "recent": []
    });
    const [selectedImages, setSelectedImages] = useState<SelectedImageObj[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
    const [images, setImages] = useState<ImageObj[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [linkId, setLinkId] = useState<string | null>(null);
    const [sourceDirectoryHandle, setSourceDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [destinationDirectoryHandle, setDestinationDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

    const handleAlbumChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedAlbum(event.target.value as string);
    };

    const handleAddToAlbum = async (albumName: string, image: ImageObj) => {
        image.folderPathList = breadcrumbs.map((b) => b.name).slice(1);
        if (!image || !image.id) return;

        setAlbums((prevAlbums) => {
            const currentAlbum = prevAlbums[albumName] || [];
            if (currentAlbum.includes(image.id)) return prevAlbums;

            const newAlbums = {
                ...prevAlbums,
                [albumName]: [...currentAlbum, JSON.stringify(image)],
            } as Record<string, string[]>;

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
                    })
                    .catch(err => console.error("Error updating photo albums in Firestore:", err));
            }

            return newAlbums;
        });
    };

    const handleRemoveFromAlbum = (albumName: string, image: ImageObj) => {
        if (!image || !image.id) return;

        setAlbums((prevAlbums) => {
            const newAlbum = (prevAlbums[albumName] || []).filter((id: string) => id !== image.id);
            const newAlbums = {
                ...prevAlbums,
                [albumName]: newAlbum,
            };

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
                        }
                    })
                    .catch(err => console.error("Error updating photo albums in Firestore:", err));
            }

            return newAlbums;
        });
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
        loading, setLoading,
        userId, setUserId,
        projectId, setProjectId,
        linkId, setLinkId,
        sourceDirectoryHandle, setSourceDirectoryHandle,
        destinationDirectoryHandle, setDestinationDirectoryHandle
    };

    return (
        <PhotoProofingContext.Provider value={value}>
            {children}
        </PhotoProofingContext.Provider>
    );
};
