
import { db } from '../../../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { indexedDBService } from './IndexedDBService';
import { Album } from '../types';

export class AlbumSyncService {
    /**
     * Syncs album entries from Firestore to IndexedDB if they have been updated since last sync.
     */
    async syncAlbums(userId: string, projectId: string, linkId: string): Promise<void> {
        if (!userId || !projectId || !linkId) {
            console.warn('Missing parameters for album sync');
            return;
        }

        const syncId = `${userId}:${projectId}:${linkId}`;
        const lastSyncTime = await indexedDBService.getLastSyncTime(projectId, syncId);

        const lastSyncTimestamp = Timestamp.fromMillis(lastSyncTime);

        try {
            const albumsRef = collection(db, 'projects', userId, 'projects', projectId, 'shared_links', linkId, 'albums');

            const q = query(
                albumsRef,
                where('updatedAt', '>', lastSyncTimestamp)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log('No new album updates to sync');
                return;
            }

            console.log(`Syncing ${querySnapshot.size} album updates...`);

            const syncPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const imageRecord = {
                    ...data,
                    id: doc.id,
                    syncId: syncId
                };
                await indexedDBService.insertOrUpdateImage(projectId, imageRecord);
            });

            await Promise.all(syncPromises);

            await indexedDBService.updateLastSyncTime(projectId, syncId, Date.now());

            console.log('Album sync completed successfully');
        } catch (error) {
            console.error('Error syncing albums from Firestore:', error);
            throw error;
        }
    }

    /**
     * Gets all synced images for a specific link
     */
    async getLocalImages(userId: string, projectId: string, linkId: string): Promise<any[]> {
        const syncId = `${userId}:${projectId}:${linkId}`;
        const allImages = await indexedDBService.getAllImages(projectId);
        return allImages.filter(img => img.syncId === syncId);
    }

    /**
     * Gets images for a specific selection (e.g., 'favourites') using the IndexedDB index.
     */
    async getImagesBySelection(projectId: string, selectionName: string): Promise<any[]> {
        return indexedDBService.getImagesBySelection(projectId, selectionName);
    }

    /**
     * Gets all synced data and aggregates it into the format expected by the UI
     */
    async getAggregatedAlbums(userId: string, projectId: string, linkId: string): Promise<Record<string, Album>> {
        const images = await this.getLocalImages(userId, projectId, linkId);
        const albums: Record<string, Album> = {
            "favourites": {
                name: "favourites",
                images: []
            },
            "custom": {
                name: "custom",
                images: []
            },
            "recent": {
                name: "recent",
                images: []
            }
        };

        images.forEach((img: any) => {
            if (img.selections && Array.isArray(img.selections)) {
                img.selections.forEach((albumName: string) => {
                    if (!albums[albumName]) {
                        albums[albumName] = {
                            name: albumName,
                            images: []
                        };
                    }
                    if (img.image) {
                        albums[albumName].images.push(img.image);
                    } else {
                        albums[albumName].images.push(JSON.stringify(img));
                    }
                });
            }
        });

        return albums;
    }
}

export const albumSyncService = new AlbumSyncService();
