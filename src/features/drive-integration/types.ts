import { Timestamp } from 'firebase/firestore';

// ─── Drive Connection ────────────────────────────────────────────────────────────
/** Represents a linked Google Drive account for a specific project */
export interface DriveConnection {
    id: string;
    /** The Mizhiv user ID (studio owner) who owns the project */
    studioUserId: string;
    /** The project this connection is for */
    projectId: string;
    /** The Google account email that was linked */
    googleEmail: string;
    /** The display name from the Google account */
    googleDisplayName?: string;
    /** The root folder ID created in the user's Drive (e.g., Mizhiv/{ProjectName}) */
    rootFolderId: string;
    /** The root folder name */
    rootFolderName: string;
    /** When the Drive was linked */
    linkedAt: Timestamp | string;
    /** Connection status */
    status: 'active' | 'revoked' | 'expired';
}

// ─── Drive File/Folder Items ─────────────────────────────────────────────────────
export interface DriveFileItem {
    id: string;
    name: string;
    mimeType: string;
    /** Whether this item is a folder */
    isFolder: boolean;
    /** Thumbnail URL for images */
    thumbnailLink?: string;
    /** Web view link */
    webViewLink?: string;
    /** File size in bytes (string from Drive API) */
    size?: string;
    /** Last modified time */
    modifiedTime?: string;
    /** Created time */
    createdTime?: string;
    /** Parent folder ID */
    parentId?: string;
}

// ─── API Request/Response Types ──────────────────────────────────────────────────
export interface ExchangeTokenRequest {
    code: string;
    redirectUri: string;
    studioUserId: string;
    projectId: string;
    projectName: string;
}

export interface ExchangeTokenResponse {
    success: boolean;
    connectionId: string;
    googleEmail: string;
    rootFolderId: string;
    rootFolderName: string;
}

export interface ListDriveContentsRequest {
    connectionId: string;
    folderId: string;
}

export interface ListDriveContentsResponse {
    files: DriveFileItem[];
    folderName: string;
}

export interface CreateDriveFolderRequest {
    connectionId: string;
    parentFolderId: string;
    folderName: string;
}

export interface CreateDriveFolderResponse {
    success: boolean;
    folderId: string;
    folderName: string;
}

export interface UploadToDriveRequest {
    connectionId: string;
    folderId: string;
    fileName: string;
    fileContent: string; // base64 encoded
    mimeType: string;
}

export interface UploadToDriveResponse {
    success: boolean;
    fileId: string;
    fileName: string;
    webViewLink?: string;
}

export interface RevokeDriveAccessRequest {
    connectionId: string;
}

export interface RevokeDriveAccessResponse {
    success: boolean;
}

// ─── Folder Sync / Upload Tracking ────────────────────────────────────────────────
/** A record of a single file that has been synced to the connected Drive. */
export interface SyncedFileRecord {
    /** Path relative to the picked folder, e.g. "Wedding/Ceremony/img_001.jpg" */
    relativePath: string;
    name: string;
    driveFileId: string;
    /** The Drive folder the file was placed in */
    folderId: string;
    size?: number | null;
    mimeType?: string | null;
    syncedAt?: string | null;
}

export interface EnsureDriveFolderTreeRequest {
    connectionId: string;
    /** Folder the tree is built under (usually the folder the admin is browsing) */
    baseFolderId: string;
    /** Relative directory paths to recreate, e.g. ["Wedding", "Wedding/Ceremony"] */
    folderPaths: string[];
}

export interface EnsureDriveFolderTreeResponse {
    /** Map of relative path -> Drive folder id ("" maps to baseFolderId) */
    pathToId: Record<string, string>;
}

export interface GetDriveManifestRequest {
    connectionId: string;
}

export interface GetDriveManifestResponse {
    files: SyncedFileRecord[];
}

export interface RecordDriveUploadsRequest {
    connectionId: string;
    records: SyncedFileRecord[];
}

export interface RecordDriveUploadsResponse {
    success: boolean;
    syncedFileCount: number;
    mizhivFolderId?: string | null;
    manifestFileId?: string | null;
}

/** Progress state for an in-flight folder sync. */
export interface SyncProgress {
    total: number;
    completed: number;
    skipped: number;
    currentFile: string;
}

// ─── Store State ─────────────────────────────────────────────────────────────────
export interface DriveIntegrationState {
    /** The active Drive connection for the current project context */
    activeConnection: DriveConnection | null;
    /** Files/folders in the currently viewed Drive folder */
    currentFiles: DriveFileItem[];
    /** Breadcrumb trail for folder navigation */
    breadcrumbs: { id: string; name: string }[];
    /** Current folder being viewed */
    currentFolderId: string | null;
    /** Loading states */
    loading: boolean;
    uploading: boolean;
    /** Whether a folder sync is in progress */
    syncing: boolean;
    /** Progress of the in-flight folder sync */
    syncProgress: SyncProgress | null;
    /** Files already synced to the connected Drive (from the manifest) */
    syncedFiles: SyncedFileRecord[];
    /** Error message */
    error: string | null;

    // Actions
    fetchConnection: (studioUserId: string, projectId: string) => Promise<void>;
    listContents: (connectionId: string, folderId: string) => Promise<void>;
    navigateToFolder: (folderId: string, folderName: string) => void;
    navigateToBreadcrumb: (index: number) => void;
    createFolder: (connectionId: string, parentFolderId: string, folderName: string) => Promise<void>;
    uploadFile: (connectionId: string, folderId: string, file: File) => Promise<void>;
    uploadMultipleFiles: (connectionId: string, folderId: string, files: File[]) => Promise<void>;
    /** Fetch the list of already-synced files for dedup. */
    fetchManifest: (connectionId: string) => Promise<SyncedFileRecord[]>;
    /**
     * Sync a picked local folder to Drive: skips already-synced files, mirrors the
     * subfolder tree under baseFolderId, uploads new files, and records the manifest.
     */
    syncFolder: (
        connectionId: string,
        baseFolderId: string,
        files: File[]
    ) => Promise<{ uploaded: number; skipped: number }>;
    revokeAccess: (connectionId: string) => Promise<void>;
    reset: () => void;
}
