export interface DriveFile {
    id: string;
    name: string;
    thumbnailLink?: string;
    mimeType?: string;
    [key: string]: any;
}

export interface DriveNode {
    id: string;
    name: string;
    folders?: Record<string, DriveNode>;
    files?: DriveFile[];
    [key: string]: any;
}

export interface Project {
    id: string;
    name: string;
    userId: string;
    driveData?: DriveNode;
    source?: string;
    driveUrl?: string;
    selectedFolders?: string[];
    createdAt?: any;
    updatedAt?: any;
    status?: string;
    [key: string]: any;
}

export interface SharedLink {
    id: string;
    name: string;
    includedFolders: string[];
    sourceProjectId: string;
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
}

