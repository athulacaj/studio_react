
import { indexedDBService } from './IndexedDBService';
import { AlbumCategory, ImageObj } from '../types';
import { getSelectedAlbums } from '../../studio-management/api/projectService';

export class AlbumSyncService {
    /**
     * Syncs album entries from Firestore to IndexedDB if they have been updated since last sync.
     */
    async syncAlbums(projectId: string, linkId: string): Promise<void> {
        if (!projectId || !linkId) {
            console.warn('Missing parameters for album sync');
            return;
        }

        const syncId = `${projectId}:${linkId}`;
        const lastSyncTime = await indexedDBService.getLastSyncTime(projectId, syncId);


        try {
            const albums = await getSelectedAlbums({
                sharedLinkId: linkId!,
                updatedAfter: new Date(lastSyncTime).toISOString()
            })

            const syncPromises = albums.map(async (album) => {
                // const image = {
                //     imageId: album.imageId,
                //     sharedLinkId: album.sharedLinkId,
                //     name: album.name,
                //     mimeType: album.mimeType,
                //     url: album.url,
                //     src: album.src,
                //     folderPathList: album.folderPathList,
                //     image: JSON.stringify(album),
                // }
                const imageRecord = {
                    id: album.imageId,
                    ...album,
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
    async getLocalImages(projectId: string, linkId: string): Promise<any[]> {
        const syncId = `${projectId}:${linkId}`;
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
    async getAggregatedAlbums(projectId: string, linkId: string): Promise<Record<string, ImageObj[]>> {
        const images = await this.getLocalImages(projectId, linkId);
        const result: Record<string, ImageObj[]> = {};

        images.forEach((img: any) => {
            if (img.selections && Array.isArray(img.selections)) {
                img.selections.forEach((albumKey: string) => {
                    if (!result[albumKey]) {
                        result[albumKey] = [];
                    }
                    result[albumKey].push(img);
                });
            }
        });

        return result;
    }

}

export const albumSyncService = new AlbumSyncService();
