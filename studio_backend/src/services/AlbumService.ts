import { eq, sql } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { albums } from '../db/schema/albums';

type NewAlbum = typeof albums.$inferInsert;

export class AlbumService {
    async createAlbums(data: NewAlbum[]) {
        if (!data || data.length === 0) {
            return [];
        }
        
        // We can do bulk insert with onConflictDoUpdate to support upsert
        const newAlbums = await db.insert(albums)
            .values(data)
            .onConflictDoUpdate({
                target: [albums.imageId, albums.linkId],
                set: {
                    image: sql`excluded.image`,
                    selections: sql`excluded.selections`,
                    updatedAt: sql`excluded.updated_at`
                }
            })
            .returning();
            
        return newAlbums;
    }

    async getAlbums(linkId?: string) {
        const conditions = [];

        if (linkId) {
            conditions.push(eq(albums.linkId, linkId));
        }

        const query = db.select().from(albums);

        if (conditions.length > 0) {
            query.where(conditions[0]);
        }

        return await query;
    }
}
