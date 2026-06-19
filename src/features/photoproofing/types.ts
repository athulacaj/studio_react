export interface ImageObj {
    src?: string;
    folderPathList?: string[];
    thumbnailLink?: string;
    [key: string]: any;
}
export interface SelectedImageObj {
    src?: string;
    folderPathList?: string[];
    thumbnailLink?: string;
    [key: string]: any;
    selections: string[];
}

export interface Folder {
    id: string;
    name: string;
    [key: string]: any;
}

export interface AlbumCategory {
    name: string;
    images: string[];
    id: string;
}


// PhotoProofingStore type is now defined in store/usePhotoProofingStore.ts
