export interface ImageObj {
    src?: string;
    thumbnailLink?: string;
    [key: string]: any;
}

export interface Folder {
    id: string;
    name: string;
    [key: string]: any;
}


export interface PhotoProofingContextType {
    albums: Record<string, number[]>;
    selectedAlbum: string;
    images: ImageObj[];
    setAlbums: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
    setSelectedAlbum: React.Dispatch<React.SetStateAction<string>>;
    setImages: React.Dispatch<React.SetStateAction<ImageObj[]>>;
    handleAlbumChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
    handleAddToAlbum: (albumName: string, photoIndex: number) => void;
    handleRemoveFromAlbum: (albumName: string, photoIndex: number) => void;
    folders: Folder[];
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
    currentFolderId: string | null;
    setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>>;
    breadcrumbs: { id: string; name: string }[];
    setBreadcrumbs: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
    navigateToFolder: (folderId: string | null, folderName: string) => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}