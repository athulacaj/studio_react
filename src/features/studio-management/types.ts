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


export enum ProjectStatus {
    READY_FOR_SYNC = 'ready_for_sync',
    SYNCED = 'synced',
    FAILED = 'failed',
    INITIALIZING = 'initializing',
}

export enum Source {
    GOOGLE_PHOTOS = 'google_photos',
    GOOGLE_DRIVE = 'google_drive',
}

export enum ProjectAssets {
    GDRIVE = 'gdrive',
    STORAGE = 'storage',
}


// id: uuid("id").defaultRandom().primaryKey().notNull(),
// name: varchar("name", { length: 255 }).notNull(),
// description: text("description"),
// userId: uuid("user_id").notNull(),

// // Google Drive Sync Fields
// source: source("source"),
// status: projectStatus("project_status"),
// projectAssets: projectAssets("project_assets"),

// createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
// updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
// driveUrl: text("drive_url"),

export interface Project {
    id: string;
    name: string;
    userId: string;
    description?: string;
    source: Source;
    status: ProjectStatus;
    projectAssets: ProjectAssets;
    createdAt?: string;
    updatedAt?: string;
    driveUrl?: string;
    driveData?: any;
    selectedFolders?: any;
    syncedFolders?: any;
}
// id: uuid("id").defaultRandom().primaryKey().notNull(),
// projectId: uuid("project_id").notNull(),

// selectedFolders: jsonb("selected_folders"),
// driveData: jsonb("drive_data"),
// syncedFolders: jsonb("synced_folders"),
// createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
// updatedAt

export interface DriveData {
    id: string;
    projectId: string;
    selectedFolders: string[];
    driveData: DriveNode;
    syncedFolders: SyncedFolder[];
    createdAt: string;
    updatedAt: string;
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