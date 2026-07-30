import { eq, gt, desc, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { sharedLinks } from '../db/schema/shared_links';

type NewSharedLink = typeof sharedLinks.$inferInsert;

export class SharedLinkService {
    async createSharedLink(data: NewSharedLink) {
        const [newSharedLink] = await db.insert(sharedLinks).values(data).returning();
        return newSharedLink;
    }

    async getSharedLinks(id?: string, sourceProjectId?: string, createdBy?: string, updatedAfter?: string) {
        const conditions = [];

        if (id) {
            conditions.push(eq(sharedLinks.id, id));
        }

        if (sourceProjectId) {
            conditions.push(eq(sharedLinks.sourceProjectId, sourceProjectId));
        }

        if (createdBy) {
            conditions.push(eq(sharedLinks.createdBy, createdBy));
        }

        if (updatedAfter) {
            conditions.push(gt(sharedLinks.updatedAt, updatedAfter));
        }

        const query = db.select().from(sharedLinks).orderBy(desc(sharedLinks.updatedAt));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return await query;
    }

    async updateSharedLink(id: string, data: Partial<NewSharedLink>) {
        const [updatedLink] = await db.update(sharedLinks)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(eq(sharedLinks.id, id))
            .returning();
        
        if (!updatedLink) {
            throw new Error(`Shared link with id ${id} not found`);
        }
        return updatedLink;
    }
}
