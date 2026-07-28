import { eq, gt, desc, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { selectedAlbums } from '../db/schema/selected_albums';

type NewSelectedAlbum = typeof selectedAlbums.$inferInsert;

export class SelectedAlbumService {
    async createSelectedAlbum(data: NewSelectedAlbum) {
        const [newSelectedAlbum] = await db.insert(selectedAlbums).values(data).returning();
        return newSelectedAlbum;
    }

    async getSelectedAlbums(sharedLinkId?: string, updatedAfter?: string) {
        const conditions = [];

        if (sharedLinkId) {
            conditions.push(eq(selectedAlbums.sharedLinkId, sharedLinkId));
        }

        if (updatedAfter) {
            conditions.push(gt(selectedAlbums.updatedAt, updatedAfter));
        }

        const query = db.select().from(selectedAlbums).orderBy(desc(selectedAlbums.updatedAt));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return await query;
    }
}
