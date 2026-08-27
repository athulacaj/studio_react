/**
 * Upload Task Manager
 *
 * Orchestrates the full folder-based upload flow:
 *   1. Scan folder  →  2. Index to backend (chunked)  →  3. Cache in IndexedDB (chunked)
 *   4. Upload each file to Drive  →  5. Update status in backend + IDB
 *
 * Optimised for up to ~50 000 files across many directories using
 * client-side resumable uploads and delta syncs.
 */
import type {
    IndexedFileEntry,
    UploadQueueItem,
    FolderUploadProgress,
} from '../types';
import { pickAndScanFolder, scanDirectory } from './fileIndexService';
import type { ScanProgressCallback } from './fileIndexService';
import { driveIndexedDBService } from './driveIndexedDBService';
import { indexFiles, upsertFile } from '../api/fileApiService';
import { guessMimeType } from '../utils';
import { ensureDriveFolderTree, getDriveAccessToken } from '../../studio-management/api/GoogleService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert an IndexedFileEntry to an UploadQueueItem (serialisable). */
const toQueueItem = (entry: IndexedFileEntry, existingStatus?: string, existingUrl?: string | null): UploadQueueItem => ({
    id: entry.id,
    name: entry.name,
    relativePath: entry.relativePath,
    size: entry.size,
    lastModified: entry.lastModified.toISOString(),
    mimeType: entry.mimeType,
    status: (existingStatus as any) || 'NOT_UPLOADED',
    url: existingUrl || null,
    error: null,
});

// ─── Callbacks type ───────────────────────────────────────────────────────────
export interface UploadTaskCallbacks {
    onProgress: (progress: FolderUploadProgress) => void;
    onFileComplete: (item: UploadQueueItem) => void;
}

export interface IndexCallbacks {
    onScanProgress?: ScanProgressCallback;
    onIndexProgress?: (indexed: number, total: number) => void;
}

export interface IndexResult {
    folderName: string;
    handle: FileSystemDirectoryHandle;
    files: IndexedFileEntry[];
    queueItems: UploadQueueItem[];
}

// ─── Core Logic ───────────────────────────────────────────────────────────────

/**
 * Shared logic to persist scanned files to the backend and IndexedDB,
 * skipping files that are already uploaded.
 */
const persistScannedFiles = async (
    projectId: string,
    files: IndexedFileEntry[],
    callbacks?: IndexCallbacks
): Promise<UploadQueueItem[]> => {
    // 1. Fetch existing files from IDB to preserve UPLOADED status during delta syncs
    const existingRecords = await driveIndexedDBService.getAllFiles(projectId);
    const existingMap = new Map(existingRecords.map(r => [r.id, r]));

    // 2. Build queue items
    const queueItems = files.map(f => {
        const existing = existingMap.get(f.id);
        return toQueueItem(f, existing?.status, existing?.url);
    });

    // 3. Persist to backend (chunked bulk upsert — 500 per request)
    await indexFiles(
        projectId,
        queueItems.map((q) => ({
            name: q.name,
            relativePath: q.relativePath,
            updatedAt: q.lastModified,
            deleted: false,
            status: q.status,
            url: q.url,
        })),
        callbacks?.onIndexProgress
    );

    // 4. Cache in IndexedDB (chunked — 1000 per transaction)
    await driveIndexedDBService.bulkUpsertFiles(projectId, queueItems);

    return queueItems;
};

// ─── Index Flow ───────────────────────────────────────────────────────────────

/**
 * Pick a folder, scan for images, persist metadata to the backend + IndexedDB.
 */
export const indexFolder = async (
    projectId: string,
    callbacks?: IndexCallbacks
): Promise<IndexResult> => {
    const { folderName, handle, files } = await pickAndScanFolder(callbacks?.onScanProgress);

    if (files.length === 0) {
        throw new Error('No supported image files were found in the selected folder.');
    }

    const queueItems = await persistScannedFiles(projectId, files, callbacks);
    await driveIndexedDBService.saveFolderHandle(projectId, handle);

    return { folderName, handle, files, queueItems };
};

/**
 * Delta Sync: Re-read the saved folder handle, find new files, add to queue.
 */
export const refreshFolderSync = async (
    projectId: string,
    callbacks?: IndexCallbacks
): Promise<IndexResult> => {
    const dirHandle = await driveIndexedDBService.getFolderHandle(projectId);
    if (!dirHandle) {
        throw new Error('Cannot refresh: the folder handle was not found. Please select the folder again.');
    }
    const permStatus = await (dirHandle as any).requestPermission({ mode: 'read' });
    if (permStatus !== 'granted') {
        throw new Error('Permission to read the folder was denied. Please select the folder again.');
    }

    const files = await scanDirectory(dirHandle, '', callbacks?.onScanProgress);
    if (files.length === 0) {
        throw new Error('No supported image files were found in the selected folder.');
    }

    const queueItems = await persistScannedFiles(projectId, files, callbacks);

    return { folderName: dirHandle.name, handle: dirHandle, files, queueItems };
};

// ─── Upload Flow ──────────────────────────────────────────────────────────────

/**
 * Upload all NOT_UPLOADED files directly to Google Drive via Client-Side fetch.
 */
export const runUploadTask = async (
    projectId: string,
    connectionId: string,
    baseFolderId: string,
    fileEntries: IndexedFileEntry[] | undefined,
    callbacks: UploadTaskCallbacks
): Promise<{ uploaded: number; failed: number }> => {

    const pending = await driveIndexedDBService.getFilesByStatus(projectId, 'NOT_UPLOADED');
    if (pending.length === 0) {
        return { uploaded: 0, failed: 0 };
    }

    // 1. Gather all unique folder paths to replicate in Google Drive
    const uniquePaths = [...new Set(pending.map(p => p.relativePath).filter(Boolean))];
    let pathToId: Record<string, string> = { "": baseFolderId };

    if (uniquePaths.length > 0) {
        callbacks.onProgress({ total: pending.length, completed: 0, failed: 0, currentFile: 'Creating folder structure in Google Drive...' });
        const treeRes = await ensureDriveFolderTree({ connectionId, baseFolderId, folderPaths: uniquePaths });
        pathToId = { ...pathToId, ...treeRes.data.pathToId };
    }

    // 2. Map files to handles
    const handleMap = new Map<string, FileSystemFileHandle>();
    if (fileEntries) {
        for (const entry of fileEntries) handleMap.set(entry.id, entry.handle);
    } else {
        const dirHandle = await driveIndexedDBService.getFolderHandle(projectId);
        if (!dirHandle) throw new Error('Cannot resume: folder handle missing.');
        const permStatus = await (dirHandle as any).requestPermission({ mode: 'read' });
        if (permStatus !== 'granted') throw new Error('Permission denied.');
        const scanned = await scanDirectory(dirHandle);
        for (const entry of scanned) handleMap.set(entry.id, entry.handle);
    }

    // 3. Obtain Google Drive Access Token
    callbacks.onProgress({ total: pending.length, completed: 0, failed: 0, currentFile: 'Securing upload token...' });
    let accessToken = (await getDriveAccessToken({ connectionId })).data.accessToken;

    const progress: FolderUploadProgress = {
        total: pending.length,
        completed: 0,
        failed: 0,
        currentFile: '',
    };

    let uploaded = 0;
    let failed = 0;

    for (const item of pending) {
        const handle = handleMap.get(item.id);
        if (!handle) {
            item.status = 'FAILED';
            item.error = 'File not found locally';
            await driveIndexedDBService.updateFileStatus(projectId, item.id, 'FAILED');
            failed++;
            progress.failed = failed;
            progress.completed++;
            callbacks.onProgress({ ...progress });
            callbacks.onFileComplete({ ...item });
            continue;
        }

        progress.currentFile = item.name;
        callbacks.onProgress({ ...progress });

        try {
            const file = await handle.getFile();
            const targetFolderId = pathToId[item.relativePath] || baseFolderId;
            const mimeType = item.mimeType || guessMimeType(file);

            // Step A: Initiate Resumable Upload
            const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Upload-Content-Type': mimeType,
                    'X-Upload-Content-Length': file.size.toString(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    parents: [targetFolderId],
                })
            });

            // Handle token expiration
            if (initRes.status === 401) {
                accessToken = (await getDriveAccessToken({ connectionId })).data.accessToken;
                throw new Error('Token expired, retrying on next pass...'); // naive retry for this file
            }

            if (!initRes.ok) {
                const errText = await initRes.text();
                throw new Error(`Init failed: ${errText}`);
            }

            const uploadUrl = initRes.headers.get('Location');
            if (!uploadUrl) throw new Error('No upload URL returned from Google.');

            // Step B: Upload File Content
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Length': file.size.toString(),
                },
                body: file
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${errText}`);
            }

            const driveData = await uploadRes.json();

            // The resumable upload API doesn't return webViewLink by default unless we use fields, 
            // but we can query it or construct a fallback if missing. We'll use a direct fetch to get it if needed.
            let driveUrl = driveData.webViewLink;
            if (!driveUrl) {
                // Fetch the webViewLink via standard GET
                const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${driveData.id}?fields=webViewLink`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const metaData = await metaRes.json();
                driveUrl = metaData.webViewLink || `https://drive.google.com/file/d/${driveData.id}/view`;
            }

            // Update Backend
            await upsertFile(projectId, {
                name: item.name,
                relativePath: item.relativePath,
                updatedAt: new Date().toISOString(),
                status: 'UPLOADED',
                url: driveUrl,
            });

            // Update IDB
            await driveIndexedDBService.updateFileStatus(projectId, item.id, 'UPLOADED', driveUrl);

            item.status = 'UPLOADED';
            item.url = driveUrl;
            uploaded++;
        } catch (err: any) {
            console.error(`Failed to upload ${item.name}:`, err);
            item.status = 'FAILED';
            item.error = err?.message || 'Upload failed';
            await driveIndexedDBService.updateFileStatus(projectId, item.id, 'FAILED');
            failed++;
            progress.failed = failed;
        }

        progress.completed++;
        callbacks.onProgress({ ...progress });
        callbacks.onFileComplete({ ...item });
    }

    return { uploaded, failed };
};
