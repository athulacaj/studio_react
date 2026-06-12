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

export interface Album {
    name: string;
    images: string[];
}


// PhotoProofingStore type is now defined in store/usePhotoProofingStore.ts