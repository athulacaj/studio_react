import { Timestamp } from "firebase/firestore";

export interface DriveFile {
    id: string;
    name: string;
    thumbnailLink?: string;
    mimeType?: string;
    folderPathList: string[];
    [key: string]: any;
}

export interface DriveNode {
    id: string;
    name: string;
    folders?: Record<string, DriveNode>;
    files?: DriveFile[];
    [key: string]: any;
}

export interface SelectedFolder {
    id: string;
    syncedAt: Timestamp;
}

export interface LinkCategory {
    id: string;
    label: string;
    isHidden?: boolean;
}

export interface Project {
    id: string;
    name: string;
    userId: string;
    driveData?: DriveNode;
    source?: string;
    driveUrl?: string;
    selectedFolders?: SelectedFolder[];
    createdAt?: any;
    updatedAt?: any;
    status?: string;
    [key: string]: any;
    syncedFolders?: Record<string, SyncedFolder>;
}

export interface SharedLink {
    id: string;
    name: string;
    includedFolders: string[];
    categories?: LinkCategory[];
    sourceProjectId: string;
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
}

export interface SyncedFolder {
    filePath: string;
    syncTime: Timestamp;
    filesCount: number;
}