import { create } from 'zustand';
import { fetchDriveConnection } from '../api/driveAuthService';
import {
    listDriveContents as listDriveContentsApi,
    createDriveFolder as createDriveFolderApi,
    uploadToDrive as uploadToDriveApi,
    revokeDriveAccess as revokeDriveAccessApi,
    ensureDriveFolderTree as ensureDriveFolderTreeApi,
    getDriveManifest as getDriveManifestApi,
    recordDriveUploads as recordDriveUploadsApi,
} from '../api/driveFileService';
import type {
    DriveConnection,
    DriveFileItem,
    DriveIntegrationState,
    SyncedFileRecord,
} from '../types';
import { fileRelPath, dirOfPath, guessMimeType } from '../utils';

/** Convert a File to a base64 string (data part only). */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const initialState = {
    activeConnection: null as DriveConnection | null,
    currentFiles: [] as DriveFileItem[],
    breadcrumbs: [] as { id: string; name: string }[],
    currentFolderId: null as string | null,
    loading: false,
    uploading: false,
    syncing: false,
    syncProgress: null as DriveIntegrationState['syncProgress'],
    syncedFiles: [] as SyncedFileRecord[],
    error: null as string | null,
};

export const useDriveIntegrationStore = create<DriveIntegrationState>((set, get) => ({
    ...initialState,

    fetchConnection: async (studioUserId: string, projectId: string) => {
        set({ loading: true, error: null });
        try {
            const connection = await fetchDriveConnection(studioUserId, projectId);
            set({ activeConnection: connection, loading: false });

            // If we have a connection, auto-load root folder contents
            if (connection) {
                await get().listContents(connection.id, connection.rootFolderId);
                set({
                    breadcrumbs: [{ id: connection.rootFolderId, name: connection.rootFolderName }],
                    currentFolderId: connection.rootFolderId,
                });
            }
        } catch (error: any) {
            console.error('Error fetching Drive connection:', error);
            set({ error: error.message || 'Failed to fetch Drive connection', loading: false });
        }
    },

    listContents: async (connectionId: string, folderId: string) => {
        set({ loading: true, error: null });
        try {
            const result = await listDriveContentsApi({ connectionId, folderId });
            set({
                currentFiles: result.files,
                currentFolderId: folderId,
                loading: false,
            });
        } catch (error: any) {
            console.error('Error listing Drive contents:', error);
            set({ error: error.message || 'Failed to list Drive contents', loading: false });
        }
    },

    navigateToFolder: (folderId: string, folderName: string) => {
        const { breadcrumbs, activeConnection } = get();
        set({
            breadcrumbs: [...breadcrumbs, { id: folderId, name: folderName }],
            currentFolderId: folderId,
        });
        if (activeConnection) {
            get().listContents(activeConnection.id, folderId);
        }
    },

    navigateToBreadcrumb: (index: number) => {
        const { breadcrumbs, activeConnection } = get();
        const target = breadcrumbs[index];
        if (!target || !activeConnection) return;

        set({
            breadcrumbs: breadcrumbs.slice(0, index + 1),
            currentFolderId: target.id,
        });
        get().listContents(activeConnection.id, target.id);
    },

    createFolder: async (connectionId: string, parentFolderId: string, folderName: string) => {
        set({ loading: true, error: null });
        try {
            await createDriveFolderApi({ connectionId, parentFolderId, folderName });
            // Refresh the current folder contents
            await get().listContents(connectionId, parentFolderId);
        } catch (error: any) {
            console.error('Error creating Drive folder:', error);
            set({ error: error.message || 'Failed to create folder', loading: false });
        }
    },

    uploadFile: async (connectionId: string, folderId: string, file: File) => {
        set({ uploading: true, error: null });
        try {
            const base64 = await fileToBase64(file);
            await uploadToDriveApi({
                connectionId,
                folderId,
                fileName: file.name,
                fileContent: base64,
                mimeType: file.type,
            });
            // Refresh folder contents
            await get().listContents(connectionId, folderId);
            set({ uploading: false });
        } catch (error: any) {
            console.error('Error uploading to Drive:', error);
            set({ error: error.message || 'Failed to upload file', uploading: false });
        }
    },

    uploadMultipleFiles: async (connectionId: string, folderId: string, files: File[]) => {
        set({ uploading: true, error: null });
        try {
            // Upload files sequentially to avoid overwhelming the API
            for (const file of files) {
                const base64 = await fileToBase64(file);
                await uploadToDriveApi({
                    connectionId,
                    folderId,
                    fileName: file.name,
                    fileContent: base64,
                    mimeType: file.type,
                });
            }
            // Refresh folder contents after all uploads
            await get().listContents(connectionId, folderId);
            set({ uploading: false });
        } catch (error: any) {
            console.error('Error uploading files to Drive:', error);
            set({ error: error.message || 'Failed to upload files', uploading: false });
        }
    },

    fetchManifest: async (connectionId: string) => {
        try {
            const { files } = await getDriveManifestApi({ connectionId });
            set({ syncedFiles: files });
            return files;
        } catch (error: any) {
            console.error('Error fetching Drive manifest:', error);
            return [];
        }
    },

    syncFolder: async (connectionId: string, baseFolderId: string, files: File[]) => {
        set({
            syncing: true,
            error: null,
            syncProgress: { total: 0, completed: 0, skipped: 0, currentFile: '' },
        });
        try {
            // 1. Load what's already been synced so we can skip duplicates.
            const { files: manifestFiles } = await getDriveManifestApi({ connectionId });
            const syncedSet = new Set(manifestFiles.map((f) => f.relativePath));
            set({ syncedFiles: manifestFiles });

            const newFiles = files.filter((f) => !syncedSet.has(fileRelPath(f)));
            const skipped = files.length - newFiles.length;
            set({ syncProgress: { total: newFiles.length, completed: 0, skipped, currentFile: '' } });

            if (newFiles.length === 0) {
                set({ syncing: false });
                return { uploaded: 0, skipped };
            }

            // 2. Recreate the local subfolder tree under the current Drive folder.
            const folderPaths = Array.from(
                new Set(newFiles.map((f) => dirOfPath(fileRelPath(f))).filter(Boolean))
            );
            const { pathToId } = await ensureDriveFolderTreeApi({
                connectionId,
                baseFolderId,
                folderPaths,
            });

            // 3. Upload each new file into its mirrored folder.
            const records: SyncedFileRecord[] = [];
            for (const file of newFiles) {
                const rel = fileRelPath(file);
                const folderId = pathToId[dirOfPath(rel)] || baseFolderId;
                set((s) => ({
                    syncProgress: s.syncProgress
                        ? { ...s.syncProgress, currentFile: file.name }
                        : null,
                }));
                const base64 = await fileToBase64(file);
                const res = await uploadToDriveApi({
                    connectionId,
                    folderId,
                    fileName: file.name,
                    fileContent: base64,
                    mimeType: guessMimeType(file),
                });
                records.push({
                    relativePath: rel,
                    name: file.name,
                    driveFileId: res.fileId,
                    folderId,
                    size: file.size,
                    mimeType: guessMimeType(file),
                });
                set((s) => ({
                    syncProgress: s.syncProgress
                        ? { ...s.syncProgress, completed: s.syncProgress.completed + 1 }
                        : null,
                }));
            }

            // 4. Record the manifest (Firestore + self-healing in-Drive file).
            await recordDriveUploadsApi({ connectionId, records });
            set({ syncedFiles: [...manifestFiles, ...records], syncing: false });

            // 5. Refresh the browser so the new files/folders appear.
            await get().listContents(connectionId, baseFolderId);

            return { uploaded: records.length, skipped };
        } catch (error: any) {
            console.error('Error syncing folder to Drive:', error);
            set({ error: error.message || 'Failed to sync folder', syncing: false });
            throw error;
        }
    },

    revokeAccess: async (connectionId: string) => {
        set({ loading: true, error: null });
        try {
            await revokeDriveAccessApi({ connectionId });
            set({
                ...initialState,
                loading: false,
            });
        } catch (error: any) {
            console.error('Error revoking Drive access:', error);
            set({ error: error.message || 'Failed to revoke access', loading: false });
        }
    },

    reset: () => {
        set(initialState);
    },
}));
