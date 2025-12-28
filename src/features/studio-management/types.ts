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
    id?: string;
    userId?: string;
    driveData?: DriveNode;
    source?: string;
    driveUrl?: string;
    [key: string]: any;
}

export interface SharedLink {
    includedFolders?: string[];
    [key: string]: any;
}

