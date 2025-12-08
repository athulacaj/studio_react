import { createContext, useContext } from 'react';




export interface PhotoProofingContextType {
    albums: any;
    selectedAlbum: any;
    images: any;
    setAlbums: any;
    setSelectedAlbum: any;
    setImages: any;
    handleAlbumChange: any;
    handleAddToAlbum: any;
    handleRemoveFromAlbum: any;
    folders: any;
    setFolders: any;
    currentFolderId: any;
    setCurrentFolderId: any;
    breadcrumbs: any;
    setBreadcrumbs: any;
    navigateToFolder: any;
}

export const PhotoProofingContext = createContext<PhotoProofingContextType | null>(null);

export const usePhotoProofing = () => {
    const context: PhotoProofingContextType | null = useContext(PhotoProofingContext);
    if (!context) {
        throw new Error('usePhotoProofing must be used within a PhotoProofingProvider');
    }
    return context;
};
