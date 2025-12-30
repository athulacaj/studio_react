
export interface SyncMetadata {
    id: string; // userId:projectId:linkId
    lastSyncTime: number;
}

export class IndexedDBService {
    private dbNamePrefix: string = 'PhotoProofingDB_';
    private dbVersion: number = 1;
    // Map to keep track of open DB connections: { projectId: IDBDatabase }
    private dbs: Map<string, IDBDatabase> = new Map();

    constructor() { }

    private async getDB(projectId: string): Promise<IDBDatabase> {
        if (this.dbs.has(projectId)) {
            const db = this.dbs.get(projectId);
            if (db) return db;
        }

        const dbName = `${this.dbNamePrefix}${projectId}`;
        const imagesStore = `${projectId}_images`;
        const metadataStore = `${projectId}_sync_metadata`;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(imagesStore)) {
                    db.createObjectStore(imagesStore, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(metadataStore)) {
                    db.createObjectStore(metadataStore, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => {
                const db = request.result;
                this.dbs.set(projectId, db);
                resolve(db);
            };

            request.onerror = () => {
                console.error(`IndexedDB error for project ${projectId}:`, request.error);
                reject(request.error);
            };
        });
    }

    private getStoreNames(projectId: string) {
        return {
            images: `${projectId}_images`,
            metadata: `${projectId}_sync_metadata`
        };
    }

    async getImageById(projectId: string, id: string): Promise<any> {
        const db = await this.getDB(projectId);
        const { images: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllImages(projectId: string): Promise<any[]> {
        const db = await this.getDB(projectId);
        const { images: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async insertOrUpdateImage(projectId: string, image: any): Promise<void> {
        const db = await this.getDB(projectId);
        const { images: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(image);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAll(projectId: string): Promise<void> {
        const db = await this.getDB(projectId);
        const { images: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getLastSyncTime(projectId: string, syncId: string): Promise<number> {
        const db = await this.getDB(projectId);
        const { metadata: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(syncId);

            request.onsuccess = () => resolve(request.result?.lastSyncTime || 0);
            request.onerror = () => reject(request.error);
        });
    }

    async updateLastSyncTime(projectId: string, syncId: string, timestamp: number): Promise<void> {
        const db = await this.getDB(projectId);
        const { metadata: storeName } = this.getStoreNames(projectId);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ id: syncId, lastSyncTime: timestamp });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const indexedDBService = new IndexedDBService();
