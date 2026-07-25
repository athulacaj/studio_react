/**
 * Drive IndexedDB Service
 *
 * Provides local caching of file metadata and folder handles for the
 * folder-based upload flow.  Follows the same pattern as the existing
 * `photoproofing/services/IndexedDBService.ts`.
 */
import type { UploadQueueItem, FileUploadStatus } from '../types';

const DB_NAME_PREFIX = 'DriveFilesDB_';
const DB_VERSION = 1;
const FILES_STORE = 'files';
const HANDLES_STORE = 'handles';

const IDB_CHUNK_SIZE = 1000;

class DriveIndexedDBService {
    private dbs: Map<string, IDBDatabase> = new Map();

    // ─── DB lifecycle ──────────────────────────────────────────────────────
    private async getDB(projectId: string): Promise<IDBDatabase> {
        if (this.dbs.has(projectId)) {
            const existing = this.dbs.get(projectId);
            if (existing) return existing;
        }

        const dbName = `${DB_NAME_PREFIX}${projectId}`;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(FILES_STORE)) {
                    const store = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
                    store.createIndex('status', 'status', { unique: false });
                }

                if (!db.objectStoreNames.contains(HANDLES_STORE)) {
                    db.createObjectStore(HANDLES_STORE, { keyPath: 'key' });
                }
            };

            request.onsuccess = () => {
                const db = request.result;
                this.dbs.set(projectId, db);
                resolve(db);
            };

            request.onerror = () => {
                console.error(`DriveIndexedDB error for project ${projectId}:`, request.error);
                reject(request.error);
            };
        });
    }

    // ─── File operations ───────────────────────────────────────────────────
    /**
     * Insert or update a batch of file records.
     * For large sets (up to 50k) the writes are chunked into separate
     * transactions of IDB_CHUNK_SIZE (1000) to avoid blocking the UI thread.
     */
    async bulkUpsertFiles(projectId: string, files: UploadQueueItem[]): Promise<void> {
        const db = await this.getDB(projectId);

        // Process in chunks to keep each IDB transaction short
        for (let i = 0; i < files.length; i += IDB_CHUNK_SIZE) {
            const batch = files.slice(i, i + IDB_CHUNK_SIZE);
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction(FILES_STORE, 'readwrite');
                const store = tx.objectStore(FILES_STORE);

                for (const file of batch) {
                    store.put(file);
                }

                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }
    }

    /** Retrieve all cached file records for a project. */
    async getAllFiles(projectId: string): Promise<UploadQueueItem[]> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(FILES_STORE, 'readonly');
            const store = tx.objectStore(FILES_STORE);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /** Get files filtered by upload status using the `status` index. */
    async getFilesByStatus(projectId: string, status: FileUploadStatus): Promise<UploadQueueItem[]> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(FILES_STORE, 'readonly');
            const store = tx.objectStore(FILES_STORE);
            const index = store.index('status');
            const request = index.getAll(status);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /** Update a single file's status and optionally its URL. */
    async updateFileStatus(
        projectId: string,
        fileId: string,
        status: FileUploadStatus,
        url: string | null = null
    ): Promise<void> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(FILES_STORE, 'readwrite');
            const store = tx.objectStore(FILES_STORE);
            const getReq = store.get(fileId);

            getReq.onsuccess = () => {
                const record = getReq.result as UploadQueueItem | undefined;
                if (!record) {
                    resolve();
                    return;
                }
                record.status = status;
                if (url !== null) record.url = url;
                store.put(record);
            };

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // ─── Folder handle persistence ─────────────────────────────────────────
    /** Persist a FileSystemDirectoryHandle for later reuse. */
    async saveFolderHandle(projectId: string, handle: FileSystemDirectoryHandle): Promise<void> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(HANDLES_STORE, 'readwrite');
            const store = tx.objectStore(HANDLES_STORE);
            store.put({ key: 'folderHandle', handle });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Retrieve the persisted FileSystemDirectoryHandle (or null). */
    async getFolderHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(HANDLES_STORE, 'readonly');
            const store = tx.objectStore(HANDLES_STORE);
            const request = store.get('folderHandle');

            request.onsuccess = () => {
                const result = request.result;
                resolve(result?.handle ?? null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /** Clear all file records for a project. */
    async clearFiles(projectId: string): Promise<void> {
        const db = await this.getDB(projectId);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(FILES_STORE, 'readwrite');
            const store = tx.objectStore(FILES_STORE);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const driveIndexedDBService = new DriveIndexedDBService();
export default driveIndexedDBService;
